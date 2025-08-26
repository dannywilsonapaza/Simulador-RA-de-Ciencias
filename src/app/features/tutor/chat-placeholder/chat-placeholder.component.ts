import { Component } from '@angular/core';
@Component({ standalone:true, selector:'app-chat-placeholder', template:`<h2>Tutor IA</h2><div class='panel'><p>Chat en construcción.</p><textarea rows='4' placeholder='Escribe tu pregunta...' style='width:100%;'></textarea><button disabled>Enviar</button></div>`, styles:[`.panel{max-width:500px;}`] })
export class ChatPlaceholderComponent {}
