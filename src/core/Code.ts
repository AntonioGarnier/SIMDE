import { Instruction } from './Instruction';
import { FunctionalUnit, FunctionalUnitType } from './FunctionalUnit';
import { BasicBlock, SuccessorBlock } from './Blocks';
import { LEX, Lexema, Lexer } from './Lexer';
import { Label } from './Label';

export enum Opcodes {
   NOP = 0,
   ADD,
   ADDI,
   SUB,
   ADDF,
   SUBF,
   MULT,
   MULTF,
   OR,
   AND,
   XOR,
   NOR,
   SLLV,
   SRLV,
   SW,
   SF,
   LW,
   LF,
   BNE,
   BEQ,
   BGT,
   OPERROR
}

export class Code {
   public static OpcodesNames: string[] =
   ['NOP', 'ADD', 'ADDI', 'SUB', 'ADDF', 'SUBF', 'MULT', 'MULTF', 'OR', 'AND', 'XOR', 'NOR', 'SLLV', 'SRLV', 'SW', 'SF', 'LW', 'LF', 'BNE', 'BEQ', 'BGT'];

   private _lines: number;
   private _instructions: Instruction[];
   private _labels: Label[];
   private _basicBlocks: BasicBlock;
   private _numberOfBlocks: number;
   private _lexer: Lexer;

   constructor() {
      this._labels = new Array();
      this._numberOfBlocks = 0;
      this._basicBlocks = null;
      this._instructions = new Array();
      this._lexer = new Lexer();
   }

   public static opcodeToFunctionalUnitType(opcode: number): FunctionalUnitType {
      /* tslint:disable:ter-indent */
      switch (opcode) {
         case Opcodes.ADD:
         case Opcodes.ADDI:
         case Opcodes.SUB:
         case Opcodes.OR:
         case Opcodes.AND:
         case Opcodes.NOR:
         case Opcodes.XOR:
         case Opcodes.SLLV:
         case Opcodes.SRLV: return FunctionalUnitType.INTEGERSUM;
         case Opcodes.ADDF:
         case Opcodes.SUBF: return FunctionalUnitType.FLOATINGSUM;
         case Opcodes.MULT: return FunctionalUnitType.INTEGERMULTIPLY;
         case Opcodes.MULTF: return FunctionalUnitType.FLOATINGMULTIPLY;
         case Opcodes.SW:
         case Opcodes.SF:
         case Opcodes.LW:
         case Opcodes.LF: return FunctionalUnitType.MEMORY;
         case Opcodes.BNE:
         case Opcodes.BEQ:
         case Opcodes.BGT: return FunctionalUnitType.JUMP;
         default: return FunctionalUnitType.INTEGERSUM;
      }
      /* tslint:enable:ter-indent */
   }

   checkLabel(str: string, actual: BasicBlock): number {
      let index: number = -1;
      let basicBlock: BasicBlock;
      let nextSucessor: SuccessorBlock = new SuccessorBlock();
      actual.successor = nextSucessor;
      actual.successor.next = null;

      // TODO Why + ':'?
      str += ':';
      for (let i = 0; i < this._labels.length; i++) {
         if (this._labels[i].name === str) {
            index = i;
            i = this._labels.length + 1;
         }
      }

      if (index !== -1) {
         basicBlock = this.labels[index].blocks;
      } else {
         basicBlock = new BasicBlock(null, -1, null, null);
         // Add the label
         let label: Label = new Label();
         label.name = str;
         label.blocks = basicBlock;
         this._labels.push(label);
         index = this._labels.length - 1;
      }
      actual.successor.block = basicBlock;
      return index;
   }

   addLabel(str: string, lineNumber: number, actual: BasicBlock): BasicBlock {
      let index: number = -1;
      let basicBlock: BasicBlock;
      for (let i = 0; i < this._labels.length; i++) {
         if (this._labels[i].name === str) {
            index = i;
            // Break loop
            i = this._labels.length;
         }
      }

      if (index !== -1) {
         basicBlock = this.labels[index].blocks;
         if (basicBlock.lineNumber !== -1) {
            // Repeated label
            basicBlock = null;
         } else {
            basicBlock.lineNumber = lineNumber;
            basicBlock.id = this._numberOfBlocks - 1;
            actual.next = basicBlock;
         }
      } else {
         // New label, need to create a new basicBlock
         basicBlock = new BasicBlock(this.numberOfBlocks - 1, lineNumber, null, null);

         let label: Label = new Label();
         label.name = str;
         label.blocks = basicBlock;
         this.labels.push(label);

         index = this.labels.length - 1;

         if (this._basicBlocks == null) {
            this._basicBlocks = basicBlock;
         } else {
            actual.next = basicBlock;
            let sucessor: SuccessorBlock = new SuccessorBlock();
            sucessor.block = basicBlock;
            sucessor.next = actual.successor;
            actual.successor = sucessor;
         }
      }

      return basicBlock;
   }

   replaceLabels() {
      for (let i = 0; i < this._lines; i++) {
         if (this._instructions[i].opcode === Opcodes.BNE
            || this._instructions[i].opcode === Opcodes.BEQ || this._instructions[i].opcode === Opcodes.BGT) {
            let basicBlock: BasicBlock = this._labels[this._instructions[i].getOperand(2)].blocks;
            if (basicBlock.lineNumber === -1) {
               return -1;
            }
            this._instructions[i].setOperand(2, basicBlock.id, '');
         }
      }
   }

   load(input: string) {
      this._lexer.setInput(input);
      let lexema: Lexema;
      let actual: BasicBlock;
      let newBlock: boolean = true;
      // First we need the number of code lines
      lexema = this._lexer.lex();

      if (lexema.value !== LEX.LINESNUMBER) {
         throw 'Error parsing lines number';
      }
      this._lines = +lexema.yytext;

      this.instructions.length = this._lines;

      for (let i = 0; i < this._lines; i++) {
         this.instructions[i] = new Instruction();
         this.instructions[i].id = i;
         lexema = this._lexer.lex();
         if (lexema.value === LEX.LABEL) {
            this._numberOfBlocks++;
            this.instructions[i].label = lexema.yytext;
            actual = this.addLabel(lexema.yytext, i, actual);
            if (actual == null) {
               throw `Error at line ${i + this.numberOfBlocks}, label ${lexema.yytext} already exists`;
            }
            lexema = this._lexer.lex();
         } else {
            this.instructions[i].label = '';
            if (newBlock) {
               this._numberOfBlocks++;
               let basicBlock: BasicBlock = new BasicBlock(this._numberOfBlocks - 1, i, null, null);

               if (this._basicBlocks == null) {
                  this._basicBlocks = actual = basicBlock;
               } else {
                  actual.next = basicBlock;
                  let successor: SuccessorBlock = new SuccessorBlock();
                  successor.block = basicBlock;
                  successor.next = actual.successor;
                  actual.successor = successor;
                  actual = actual.next;
               }
            }
         }
         newBlock = false;
         this.checkLexema(lexema, LEX.ID, i);
         let opcode = this.stringToOpcode(lexema.yytext);
         this._instructions[i].opcode = opcode;
         this._instructions[i].basicBlock = this._numberOfBlocks - 1;
         /* tslint:disable:ter-indent */
         switch (opcode) {
            case Opcodes.NOP:
               this.parseNooP(i);
               break;
            case Opcodes.ADD:
            case Opcodes.SUB:
            case Opcodes.MULT:
            case Opcodes.OR:
            case Opcodes.AND:
            case Opcodes.XOR:
            case Opcodes.NOR:
            case Opcodes.SLLV:
            case Opcodes.SRLV:
               this.parseOperationWithTwoGeneralRegisters(i);
               break;
            case Opcodes.ADDF:
            case Opcodes.SUBF:
            case Opcodes.MULTF:
               this.parseOperationWithTwoFloatingRegisters(i);
               break;
            case Opcodes.ADDI:
               this.parseOperationWithGeneralRegisterAndInmediate(i);
               break;
            case Opcodes.SW:
            case Opcodes.LW:
               this.parseGeneralLoadStoreOperation(i);
               break;
            case Opcodes.SF:
            case Opcodes.LF:
               this.parseFloatingLoadStoreOperation(i);
               break;
            case Opcodes.BNE:
            case Opcodes.BEQ:
            case Opcodes.BGT:
               this.parseJumpOperation(i, actual);
               newBlock = true;
               break;
            case Opcodes.OPERROR:
               throw `Error at line ${i + this.numberOfBlocks + 1} unknown opcode ${lexema.yytext}`;
            default:
               throw `Error at line ${i + this.numberOfBlocks + 1} unknown opcode ${lexema.yytext}`;
         }
         /* tslint:enable:ter-indent */
      }
      this.replaceLabels();
   }

   public stringToOpcode(stringOpcode: string): number {
      let opcode: number = Code.OpcodesNames.indexOf(stringOpcode);
      if (opcode !== -1) {
         return opcode;
      } else {
         return Opcodes.OPERROR;
      }
   }

   public stringToAddress(stringAddress: string): number[] {
      let result: number[] = new Array(2);
      let position = stringAddress.indexOf('(');
      if (position === 0) {
         result[0] = 0;
      } else {
         result[0] = +stringAddress.substring(0, position);
      }
      result[1] = this.stringToRegister(stringAddress.substr(position + 1, stringAddress.length - position - 2));
      return result;
   }

   public stringToRegister(stringRegister: string): number {
      return +stringRegister.substring(1, stringRegister.length);
   }

   public stringToInmediate(stringInmediate: string): number {
      return +stringInmediate.substring(1, stringInmediate.length);
   }

   public checkLexema(lexema: Lexema, expectedLexema: number, i: number) {
      if (lexema.value !== expectedLexema) {
         throw `Error at line ${i + this.numberOfBlocks + 1}, expected: ${LEX[expectedLexema]} got: ${lexema.yytext}`;
      }
   }

   public getBasicBlockInstruction(basicBlockIndex: number) {
      if (basicBlockIndex > this._numberOfBlocks) {
         return -1;
      }
      let actual: BasicBlock = this._basicBlocks;
      for (let i = 0; i < basicBlockIndex; i++) {
         actual = actual.next;
      }
      return actual.lineNumber;
   }

   public getFunctionalUnitType(index: number): number {
      /* tslint:disable:ter-indent */
      switch (this._instructions[index].opcode) {
         case Opcodes.ADD:
         case Opcodes.ADDI:
         case Opcodes.SUB:
         case Opcodes.OR:
         case Opcodes.AND:
         case Opcodes.NOR:
         case Opcodes.XOR: return FunctionalUnitType.INTEGERSUM;
         case Opcodes.ADDF:
         case Opcodes.SUBF: return FunctionalUnitType.FLOATINGSUM;
         case Opcodes.MULT: return FunctionalUnitType.INTEGERMULTIPLY;
         case Opcodes.MULTF: return FunctionalUnitType.FLOATINGMULTIPLY;
         case Opcodes.SW:
         case Opcodes.SF:
         case Opcodes.LW:
         case Opcodes.LF: return FunctionalUnitType.MEMORY;
         case Opcodes.BNE:
         case Opcodes.BEQ:
         case Opcodes.BGT: return FunctionalUnitType.JUMP;
         default: return FunctionalUnitType.INTEGERSUM;
      }
      /* tslint:enable:ter-indent */
   }

   public get instructions(): Instruction[] {
      return this._instructions;
   }

   public set instructions(value: Instruction[]) {
      this._instructions = value;
   }

   public get lines(): number {
      return this._lines;
   }

   public set lines(value: number) {
      this._lines = value;
   }

   public get labels(): Label[] {
      return this._labels;
   }

   public set labels(value: Label[]) {
      this._labels = value;
   }

   public get numberOfBlocks(): number {
      return this._numberOfBlocks;
   }

   public set numberOfBlocks(value: number) {
      this._numberOfBlocks = value;
   }

   public get basicBlocks(): BasicBlock {
      return this._basicBlocks;
   }

   public set basicBlocks(value: BasicBlock) {
      this._basicBlocks = value;
   }

   private parseNooP(index: number) {
      this._instructions[index].setOperand(0, 0, '');
      this._instructions[index].setOperand(1, 0, '');
      this._instructions[index].setOperand(2, 0, '');
   }

   private parseOperationWithTwoGeneralRegisters(index: number) {
      let lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGGP, index);
      this._instructions[index].setOperand(0, this.stringToRegister(lexema.yytext), lexema.yytext);
      lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGGP, index);
      this._instructions[index].setOperand(1, this.stringToRegister(lexema.yytext), lexema.yytext);
      lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGGP, index);
      this._instructions[index].setOperand(2, this.stringToRegister(lexema.yytext), lexema.yytext);
   }

   private parseOperationWithTwoFloatingRegisters(index: number) {
      let lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGFP, index);
      this._instructions[index].setOperand(0, this.stringToRegister(lexema.yytext), lexema.yytext);
      lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGFP, index);
      this._instructions[index].setOperand(1, this.stringToRegister(lexema.yytext), lexema.yytext);
      lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGFP, index);
      this._instructions[index].setOperand(2, this.stringToRegister(lexema.yytext), lexema.yytext);
   }

   private parseOperationWithGeneralRegisterAndInmediate(index: number) {
      let lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGGP, index);
      this._instructions[index].setOperand(0, this.stringToRegister(lexema.yytext), lexema.yytext);
      lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGGP, index);
      this._instructions[index].setOperand(1, this.stringToRegister(lexema.yytext), lexema.yytext);
      lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.INMEDIATE, index);
      this._instructions[index].setOperand(2, this.stringToInmediate(lexema.yytext), lexema.yytext);
   }

   private parseGeneralLoadStoreOperation(index: number) {
      let lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGGP, index);
      this._instructions[index].setOperand(0, this.stringToRegister(lexema.yytext), lexema.yytext);
      lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.ADDRESS, index);
      let result: number[] = this.stringToAddress(lexema.yytext);
      this._instructions[index].setOperand(1, result[0], lexema.yytext);
      this._instructions[index].setOperand(2, result[1], '');
   }

   private parseFloatingLoadStoreOperation(index: number) {
      let lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGFP, index);
      this._instructions[index].setOperand(0, this.stringToRegister(lexema.yytext), lexema.yytext);
      lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.ADDRESS, index);
      let result2: number[] = this.stringToAddress(lexema.yytext);
      this._instructions[index].setOperand(1, result2[0], lexema.yytext);
      this._instructions[index].setOperand(2, result2[1], '');
   }

   private parseJumpOperation(index: number, actual: BasicBlock) {
      let lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGGP, index);
      this._instructions[index].setOperand(0, this.stringToRegister(lexema.yytext), lexema.yytext);
      lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.REGGP, index);
      this._instructions[index].setOperand(1, this.stringToRegister(lexema.yytext), lexema.yytext);
      lexema = this._lexer.lex();
      this.checkLexema(lexema, LEX.ID, index);
      this._instructions[index].setOperand(2, this.checkLabel(lexema.yytext, actual), lexema.yytext);
   }
}
