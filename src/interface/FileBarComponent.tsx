import * as React from 'react';
declare var window: any;

export class FileBarComponent extends React.Component<any, any> {

   render() {
      return (<div className='row'>
         <nav className='navbar'>
            <ul className='nav navbar-nav'>
               <li className='dropdown'>
                  <a href='#' className='dropdown-toggle' data-toggle='dropdown' role='button' aria-haspopup='true' aria-expanded='false'>Archivo</a>
                  <ul className='dropdown-menu'>
                     <li><a href='#'>Cargar</a></li>
                  </ul>
               </li>
            </ul>
            <ul className='nav navbar-nav'>
               <li className='dropdown'>
                  <a href='#' className='dropdown-toggle' data-toggle='dropdown' role='button' aria-haspopup='true' aria-expanded='false'>Ver</a>
                  <ul className='dropdown-menu'>
                     <li><a href='#'>Bloques Básicos</a></li>
                     <li><a href='#'>Código Secuencial</a></li>
                  </ul>
               </li>
            </ul>
            <ul className='nav navbar-nav'>
               <li className='dropdown'>
                  <a href='#' className='dropdown-toggle' data-toggle='dropdown' role='button' aria-haspopup='true' aria-expanded='false'>Configurar</a>
                  <ul className='dropdown-menu'>
                     <li><a href='#' data-toggle='modal' data-target='#configurar-superescalar'>Configurar Máquina SuperEscalar</a></li>
                     <li><a href='#'>Opciones</a></li>
                  </ul>
               </li>
            </ul>
            <ul className='nav navbar-nav'>
               <li className='dropdown'>
                  <a href='#' className='dropdown-toggle' data-toggle='dropdown' role='button' aria-haspopup='true' aria-expanded='false'>Ejecutar</a>
                  <ul className='dropdown-menu'>
                     <li><a href='#'>Iniciar</a></li>
                     <li><a href='#'>Pausa</a></li>
                     <li><a href='#'>Parar</a></li>
                     <li><a href='#'>Atrás</a></li>
                     <li><a href='#'>Adelante</a></li>
                  </ul>
               </li>
            </ul>
            <ul className='nav navbar-nav'>
               <li className='dropdown'>
                  <a href='#' className='dropdown-toggle' data-toggle='dropdown' role='button' aria-haspopup='true' aria-expanded='false'>Ventana</a>
                  <ul className='dropdown-menu'>
                  </ul>
               </li>
            </ul>
            <ul className='nav navbar-nav'>
               <li className='dropdown'>
                  <a href='#' className='dropdown-toggle' data-toggle='dropdown' role='button' aria-haspopup='true' aria-expanded='false'>Ayuda</a>
                  <ul className='dropdown-menu'>
                     <li><a href='http://demosimde.azurewebsites.net/simde-documentation/'>Documentación</a></li>
                     <li><a href='#'>Acerca de...</a></li>
                  </ul>
               </li>
            </ul>
         </nav>
      </div>);
   }
}
