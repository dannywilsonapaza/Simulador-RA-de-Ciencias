import { Injectable } from '@angular/core';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SimulationContext {
  topic: string;
  velocity?: number;
  angle?: number;
  gravity?: number;
  height?: number;
  mass?: number;
  time?: number;
  position?: { x: number; y: number };
  currentVelocity?: { x: number; y: number };
}

@Injectable({
  providedIn: 'root'
})
export class AiTutorService {

  /**
   * Genera una respuesta simulada del tutor de IA basada en el contexto de la simulación
   * En producción, esto se reemplazaría con una llamada a la API de Anthropic
   */
  async sendMessage(
    message: string,
    context: SimulationContext,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {

    // Simular delay de red
    await this.delay(1000 + Math.random() * 1000);

    // Generar respuesta basada en palabras clave
    const lowerMessage = message.toLowerCase();

    // Respuestas sobre conceptos básicos
    if (lowerMessage.includes('velocidad') && lowerMessage.includes('que es')) {
      return this.getVelocityExplanation(context);
    }

    if (lowerMessage.includes('angulo') || lowerMessage.includes('ángulo')) {
      return this.getAngleExplanation(context);
    }

    if (lowerMessage.includes('gravedad')) {
      return this.getGravityExplanation(context);
    }

    if (lowerMessage.includes('alcance') || lowerMessage.includes('distancia')) {
      return this.getRangeExplanation(context);
    }

    if (lowerMessage.includes('altura') && (lowerMessage.includes('maxima') || lowerMessage.includes('máxima'))) {
      return this.getMaxHeightExplanation(context);
    }

    if (lowerMessage.includes('formula') || lowerMessage.includes('fórmula') || lowerMessage.includes('ecuacion') || lowerMessage.includes('ecuación')) {
      return this.getFormulasExplanation(context);
    }

    if (lowerMessage.includes('energia') || lowerMessage.includes('energía')) {
      return this.getEnergyExplanation(context);
    }

    if (lowerMessage.includes('tiempo') && lowerMessage.includes('vuelo')) {
      return this.getFlightTimeExplanation(context);
    }

    // Respuestas sobre la simulación actual
    if (lowerMessage.includes('actual') || lowerMessage.includes('ahora') || lowerMessage.includes('parametro') || lowerMessage.includes('parámetro')) {
      return this.getCurrentSimulationExplanation(context);
    }

    // Preguntas de ayuda
    if (lowerMessage.includes('como') || lowerMessage.includes('cómo')) {
      return this.getHowToExplanation(context, lowerMessage);
    }

    // Respuesta por defecto educativa
    return this.getDefaultResponse(context);
  }

  private getVelocityExplanation(context: SimulationContext): string {
    return `¡Buena pregunta! 🎯

La **velocidad inicial** es qué tan rápido sale disparado el proyectil al inicio. En tu simulación actual, la velocidad es de **${context.velocity || 20} m/s**.

Piensa en ella como la "fuerza" con la que lanzas una pelota:
- Más velocidad = el proyectil llega más lejos
- Menos velocidad = el proyectil cae más cerca

La velocidad inicial se puede dividir en dos componentes:
- **Velocidad horizontal (Vx)**: mantiene el proyectil moviéndose hacia adelante
- **Velocidad vertical (Vy)**: hace que suba y luego baje por la gravedad

Fórmulas:
- Vx = V₀ × cos(θ)
- Vy = V₀ × sin(θ)

¿Quieres que te explique más sobre algún componente específico?`;
  }

  private getAngleExplanation(context: SimulationContext): string {
    const angle = context.angle || 45;
    let angleAdvice = '';

    if (angle < 30) {
      angleAdvice = 'Con ángulos bajos, el proyectil va más horizontal, ideal para alcanzar distancia rápidamente pero con poca altura.';
    } else if (angle >= 30 && angle < 50) {
      angleAdvice = 'Este es un ángulo balanceado que combina buena altura y alcance. ¡El ángulo de 45° es el óptimo para máximo alcance!';
    } else if (angle >= 50 && angle < 70) {
      angleAdvice = 'Con ángulos mayores, el proyectil sube mucho más alto pero no llega tan lejos horizontalmente.';
    } else {
      angleAdvice = 'Con ángulos muy altos (cercanos a 90°), el proyectil sube casi verticalmente, como un cohete, pero con muy poco alcance horizontal.';
    }

    return `📐 El **ángulo de lanzamiento** determina la dirección inicial del proyectil.

Tu ángulo actual es de **${angle}°**.

${angleAdvice}

**Dato curioso**:
- 45° es el ángulo óptimo para máximo alcance horizontal (sin resistencia del aire)
- 90° hace que el proyectil suba verticalmente
- 0° sería lanzar horizontalmente

El ángulo divide la velocidad inicial en dos componentes:
- Componente X (horizontal) = V₀ × cos(${angle}°)
- Componente Y (vertical) = V₀ × sin(${angle}°)

¿Te gustaría probar diferentes ángulos para ver cómo cambia la trayectoria?`;
  }

  private getGravityExplanation(context: SimulationContext): string {
    const gravity = context.gravity || 9.8;
    let gravityContext = '';

    if (gravity < 5) {
      gravityContext = 'Es como si estuvieras en la Luna (1.62 m/s²) o en el espacio. El proyectil caerá muy lentamente.';
    } else if (gravity >= 5 && gravity < 9) {
      gravityContext = 'Gravedad menor a la de la Tierra. Podrías estar en Marte (3.71 m/s²).';
    } else if (gravity >= 9 && gravity <= 10) {
      gravityContext = 'Esta es aproximadamente la gravedad de la Tierra (9.8 m/s²).';
    } else {
      gravityContext = 'Gravedad mayor a la de la Tierra. Podrías estar en Júpiter (24.79 m/s²). ¡Todo cae mucho más rápido!';
    }

    return `�� La **gravedad** es la fuerza que atrae los objetos hacia el suelo.

Tu gravedad actual es **${gravity} m/s²**.

${gravityContext}

**¿Qué hace la gravedad?**
- Hace que el proyectil desacelere cuando sube
- Hace que acelere cuando baja
- Solo afecta el movimiento vertical (eje Y), NO el horizontal

**Fórmula del movimiento vertical:**
y(t) = h₀ + V₀y × t - ½ × g × t²

Donde:
- h₀ = altura inicial
- V₀y = velocidad vertical inicial
- g = gravedad (${gravity} m/s²)
- t = tiempo

¿Quieres experimentar con diferentes gravedades para ver el efecto?`;
  }

  private getRangeExplanation(context: SimulationContext): string {
    return `📏 El **alcance horizontal** es la distancia que recorre el proyectil antes de tocar el suelo.

**Fórmula del alcance:**
R = (V₀² × sin(2θ)) / g

Donde:
- V₀ = velocidad inicial (${context.velocity || 20} m/s)
- θ = ángulo de lanzamiento (${context.angle || 45}°)
- g = gravedad (${context.gravity || 9.8} m/s²)

**Factores que aumentan el alcance:**
✅ Mayor velocidad inicial
✅ Ángulo cercano a 45°
✅ Menor gravedad
✅ Mayor altura inicial

**Factores que disminuyen el alcance:**
❌ Menor velocidad inicial
❌ Ángulos muy bajos o muy altos
❌ Mayor gravedad

**Tip**: Prueba cambiar la velocidad inicial y el ángulo para encontrar el máximo alcance posible con tu configuración actual.`;
  }

  private getMaxHeightExplanation(context: SimulationContext): string {
    return `⛰️ La **altura máxima** es el punto más alto que alcanza el proyectil durante su vuelo.

**Fórmula de la altura máxima:**
H_max = h₀ + (V₀y²) / (2g)

Donde:
- h₀ = altura inicial (${context.height || 0} m)
- V₀y = velocidad vertical inicial = V₀ × sin(θ)
- V₀y = ${context.velocity || 20} × sin(${context.angle || 45}°)
- g = gravedad (${context.gravity || 9.8} m/s²)

**En el punto más alto:**
- La velocidad vertical = 0 m/s
- La velocidad horizontal se mantiene constante
- El proyectil empieza a caer

**Factores que aumentan la altura:**
✅ Mayor velocidad inicial
✅ Ángulo más vertical (cercano a 90°)
✅ Menor gravedad
✅ Mayor altura inicial

¿Te gustaría calcular la altura máxima para tus parámetros actuales?`;
  }

  private getFormulasExplanation(context: SimulationContext): string {
    const topic = context.topic.toLowerCase();

    if (topic.includes('parabolico') || topic === 'mruv') {
      return `📐 **Fórmulas del Movimiento Parabólico (MRUV)**

**Posición:**
- x(t) = V₀ × cos(θ) × t
- y(t) = h₀ + V₀ × sin(θ) × t - ½gt²

**Velocidad:**
- Vx(t) = V₀ × cos(θ) [constante]
- Vy(t) = V₀ × sin(θ) - g × t

**Resultados importantes:**
- Tiempo de vuelo: T = [V₀ × sin(θ) + √((V₀ × sin(θ))² + 2gh₀)] / g
- Altura máxima: H = h₀ + (V₀ × sin(θ))² / (2g)
- Alcance: R = V₀ × cos(θ) × T

**Variables:**
- V₀ = velocidad inicial (${context.velocity || 20} m/s)
- θ = ángulo (${context.angle || 45}°)
- g = gravedad (${context.gravity || 9.8} m/s²)
- h₀ = altura inicial (${context.height || 0} m)

¿Quieres que te explique alguna fórmula en detalle?`;
    }

    return `📐 Las fórmulas dependen del tipo de movimiento.

Para **${context.topic}**, las ecuaciones principales describen cómo cambian la posición y velocidad con el tiempo.

¿Sobre qué fórmula específica te gustaría aprender más?`;
  }

  private getEnergyExplanation(context: SimulationContext): string {
    return `⚡ **Energía en el Movimiento Parabólico**

En el tiro parabólico hay dos tipos de energía:

**1. Energía Cinética (EC)**
EC = ½ × m × v²

Donde:
- m = masa del proyectil (${context.mass || 5} kg)
- v = velocidad en ese momento

**2. Energía Potencial (EP)**
EP = m × g × h

Donde:
- g = gravedad (${context.gravity || 9.8} m/s²)
- h = altura en ese momento

**Conservación de la Energía:**
La energía total (EC + EP) se mantiene constante (sin fricción):
E_total = EC₀ + EP₀ = EC + EP

**En tu simulación:**
- Al inicio: mucha EC, poca EP (si h₀ es baja)
- En el punto más alto: EC mínima, EP máxima
- Al final: regresa a la configuración inicial de energías

**Importante**: La velocidad horizontal NO cambia, así que siempre hay energía cinética, incluso en el punto más alto.

¿Te gustaría calcular la energía en diferentes puntos de la trayectoria?`;
  }

  private getFlightTimeExplanation(context: SimulationContext): string {
    return `⏱️ **Tiempo de Vuelo**

El tiempo de vuelo es cuánto dura el proyectil en el aire desde que se lanza hasta que toca el suelo.

**Fórmula del tiempo de vuelo:**
T = [V₀ × sin(θ) + √((V₀ × sin(θ))² + 2 × g × h₀)] / g

**Con tus parámetros actuales:**
- V₀ = ${context.velocity || 20} m/s
- θ = ${context.angle || 45}°
- g = ${context.gravity || 9.8} m/s²
- h₀ = ${context.height || 0} m

**¿Por qué esta fórmula?**
Viene de resolver la ecuación de posición vertical cuando y(T) = 0 (el proyectil llega al suelo).

**Factores que aumentan el tiempo:**
✅ Mayor velocidad vertical inicial
✅ Mayor altura inicial
✅ Menor gravedad
✅ Ángulo más vertical

**Dato interesante**: En el punto medio del tiempo (T/2), el proyectil alcanza su altura máxima.

¿Quieres calcular el tiempo exacto para tu simulación?`;
  }

  private getCurrentSimulationExplanation(context: SimulationContext): string {
    let explanation = `📊 **Estado actual de tu simulación de ${context.topic}:**\n\n`;

    if (context.velocity !== undefined) {
      explanation += `🎯 Velocidad inicial: **${context.velocity} m/s**\n`;
    }
    if (context.angle !== undefined) {
      explanation += `📐 Ángulo: **${context.angle}°**\n`;
    }
    if (context.gravity !== undefined) {
      explanation += `🌍 Gravedad: **${context.gravity} m/s²**\n`;
    }
    if (context.height !== undefined) {
      explanation += `📏 Altura inicial: **${context.height} m**\n`;
    }
    if (context.mass !== undefined) {
      explanation += `⚖️ Masa: **${context.mass} kg**\n`;
    }

    if (context.time !== undefined && context.time > 0) {
      explanation += `\n⏱️ **Tiempo transcurrido:** ${context.time.toFixed(2)} s\n`;
    }

    if (context.position) {
      explanation += `\n📍 **Posición actual:**\n`;
      explanation += `- X: ${context.position.x.toFixed(2)} m\n`;
      explanation += `- Y: ${context.position.y.toFixed(2)} m\n`;
    }

    if (context.currentVelocity) {
      explanation += `\n🚀 **Velocidad actual:**\n`;
      explanation += `- Horizontal (Vx): ${context.currentVelocity.x.toFixed(2)} m/s\n`;
      explanation += `- Vertical (Vy): ${context.currentVelocity.y.toFixed(2)} m/s\n`;
    }

    explanation += `\n¿Sobre qué parámetro te gustaría aprender más?`;

    return explanation;
  }

  private getHowToExplanation(context: SimulationContext, message: string): string {
    if (message.includes('aumentar') || message.includes('incrementar')) {
      if (message.includes('alcance') || message.includes('distancia')) {
        return `Para **aumentar el alcance** de tu proyectil, puedes:

1. ✅ **Aumentar la velocidad inicial**: Esto es lo más efectivo
2. ✅ **Ajustar el ángulo a 45°**: Este es el ángulo óptimo
3. ✅ **Reducir la gravedad**: Si estás experimentando con diferentes planetas
4. ✅ **Lanzar desde mayor altura**: La altura inicial también suma al alcance

**Prueba esto**:
- Ajusta tu ángulo a 45°
- Aumenta la velocidad al máximo
- Observa cómo cambia el alcance

¿Quieres que te explique por qué 45° es el ángulo óptimo?`;
      }

      if (message.includes('altura')) {
        return `Para **aumentar la altura máxima**, puedes:

1. ✅ **Aumentar el ángulo**: Ángulos más verticales (cercanos a 90°) dan más altura
2. ✅ **Aumentar la velocidad inicial**: Más velocidad = más altura
3. ✅ **Reducir la gravedad**: Menor gravedad permite subir más
4. ✅ **Lanzar desde mayor altura inicial**: Esto se suma a la altura máxima

**Tip**: Un ángulo de 90° daría la máxima altura, pero 0 alcance horizontal.

¿Quieres experimentar con diferentes ángulos?`;
      }
    }

    if (message.includes('optim') || message.includes('mejor')) {
      return `🎯 **Para optimizar tu simulación:**

**Máximo alcance:**
- Ángulo: 45°
- Velocidad: la mayor posible
- Altura inicial: la mayor disponible

**Máxima altura:**
- Ángulo: 90° (vertical)
- Velocidad: la mayor posible

**Balance (altura y alcance):**
- Ángulo: 60-70°
- Velocidad: media-alta

**En el mundo real** (con resistencia del aire):
- Los ángulos óptimos son ligeramente menores a 45°
- Los objetos más pesados no llegan tan lejos como predice la teoría

¿Quieres que te explique la física detrás de estos valores óptimos?`;
    }

    return `Entiendo que quieres saber cómo hacer algo. ¿Podrías ser más específico?

Por ejemplo, puedo ayudarte con:
- Cómo aumentar el alcance
- Cómo calcular la altura máxima
- Cómo optimizar los parámetros
- Cómo entender las fórmulas

¿Sobre qué te gustaría aprender?`;
  }

  private getDefaultResponse(context: SimulationContext): string {
    const responses = [
      `¡Hola! Soy tu tutor de física 🎓. Estás trabajando con **${context.topic}**.

Puedo ayudarte con:
- Explicación de conceptos (velocidad, ángulo, gravedad)
- Fórmulas y cálculos
- Interpretación de resultados
- Optimización de parámetros
- Consejos para experimentar

¿Qué te gustaría aprender?`,

      `Interesante pregunta sobre **${context.topic}** 🤔.

Para darte la mejor respuesta, ¿podrías ser más específico? Por ejemplo:
- ¿Quieres entender un concepto?
- ¿Necesitas ayuda con una fórmula?
- ¿Quieres saber cómo optimizar algo?

Estoy aquí para ayudarte a entender la física de manera clara y sencilla.`,

      `¡Buena pregunta! La física del movimiento parabólico es fascinante 🚀.

**Tip del día**: En tu simulación actual, prueba cambiar el ángulo de lanzamiento. Verás que:
- Ángulos bajos (< 30°) = mayor alcance horizontal, poca altura
- 45° = alcance máximo (sin fricción)
- Ángulos altos (> 60°) = mucha altura, poco alcance

¿Hay algún concepto específico que te gustaría explorar?`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
