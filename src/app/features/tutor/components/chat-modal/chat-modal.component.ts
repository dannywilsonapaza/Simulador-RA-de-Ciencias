import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiTutorService, ChatMessage, SimulationContext } from '../../services/ai-tutor.service';
import { SanitizeHtmlPipe } from '../../../../shared/pipes/sanitize-html.pipe';

@Component({
  selector: 'app-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SanitizeHtmlPipe],
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.css']
})
export class ChatModalComponent implements OnInit {
  @Input() isVisible = false;
  @Input() simulationContext!: SimulationContext;
  @Output() close = new EventEmitter<void>();

  messages: ChatMessage[] = [];
  inputMessage = '';
  isAiThinking = false;

  constructor(private aiTutor: AiTutorService) {}

  ngOnInit() {
    // Mensaje de bienvenida
    this.messages.push({
      role: 'assistant',
      content: `👋 ¡Hola! Soy tu tutor de física.\n\nEstás trabajando con **${this.simulationContext.topic}**. Pregúntame sobre los conceptos, las fórmulas o la simulación actual.`
    });
  }

  async sendMessage() {
    if (!this.inputMessage.trim() || this.isAiThinking) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: this.inputMessage
    };

    this.messages.push(userMessage);
    const messageToSend = this.inputMessage;
    this.inputMessage = '';
    this.isAiThinking = true;

    try {
      const response = await this.aiTutor.sendMessage(
        messageToSend,
        this.simulationContext,
        this.messages
      );

      this.messages.push({
        role: 'assistant',
        content: response
      });
    } catch (error) {
      this.messages.push({
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu pregunta. Por favor intenta de nuevo.'
      });
    } finally {
      this.isAiThinking = false;
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  closeModal() {
    this.close.emit();
  }
}
