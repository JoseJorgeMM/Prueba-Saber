document.addEventListener('DOMContentLoaded', () => {
  const speechBubble = document.getElementById('speech');
  const farmSvg = document.getElementById('farm');
  const avatarSvg = document.getElementById('avatar');
  const nextBtn = document.getElementById('next');
  const prevBtn = document.getElementById('prev');
  let currentStep = 0;
  let isDragging = false;
  let selectedElement = null;
  let offset = { x: 0, y: 0 };

  drawTeacher();

  const steps = [
    {
      speech: "¡Bienvenidos estudiantes! Vamos a resolver este interesante problema de áreas paso a paso. ¿Están listos? Pueden hacer clic en la finca para verla más claramente.",
      action: () => drawInitialFarm(),
      interactive: true
    },
    {
      speech: "Primero, analicemos los datos importantes. Tenemos una finca rectangular de 12 metros de largo por 8 metros de ancho. Intenten mover las etiquetas de medidas para familiarizarse con las dimensiones.",
      action: () => highlightDimensions(),
      interactive: true
    },
    {
      speech: "Para calcular el área total, aplicamos la fórmula: largo × ancho. Entonces, 12m × 8m = 96m2.",
      action: () => showAreaCalculation(),
      interactive: true
    },
    {
      speech: "El campesino quiere sembrar maíz en UN CUARTO del área total. Pueden arrastrar el cuadrante sombreado para visualizar mejor esta parte.",
      action: () => showFraction(),
      interactive: true
    },
    {
      speech: "Si el área total es 96m2, para encontrar un cuarto realizamos: 96m2 ÷ 4 = 24m2. Hagan clic en las diferentes partes para ver sus áreas.",
      action: () => showFinalCalculation(),
      interactive: true
    },
    {
      speech: "¡Excelente! El área para sembrar maíz es 24m2. La respuesta correcta es la opción a). ¡Han hecho un gran trabajo!",
      action: () => highlightAnswer(),
      interactive: false
    }
  ];

  // SVG interaction handlers
  function startDrag(evt) {
    if (!steps[currentStep].interactive) return;
    
    const target = evt.target;
    if (target.classList.contains('draggable')) {
      selectedElement = target;
      isDragging = true;
      
      // Get element's current position
      const bbox = selectedElement.getBBox();
      const mousePos = getMousePosition(evt);
      offset.x = mousePos.x - bbox.x;
      offset.y = mousePos.y - bbox.y;
      
      // Add dragging class
      selectedElement.classList.add('dragging');
      
      // Bring element to front
      selectedElement.parentNode.appendChild(selectedElement);
    }
  }

  function drag(evt) {
    if (isDragging && selectedElement) {
      evt.preventDefault();
      const coord = getMousePosition(evt);
      
      // Constrain movement within the farm boundaries
      const bbox = selectedElement.getBBox();
      const farmBounds = {
        left: 50,
        right: 350 - bbox.width,
        top: 50,
        bottom: 250 - bbox.height
      };
      
      let newX = Math.max(farmBounds.left, Math.min(farmBounds.right, coord.x - offset.x));
      let newY = Math.max(farmBounds.top, Math.min(farmBounds.bottom, coord.y - offset.y));
      
      selectedElement.setAttributeNS(null, "x", newX);
      selectedElement.setAttributeNS(null, "y", newY);
      
      // Update associated text position if needed
      const associatedText = selectedElement.nextElementSibling;
      if (associatedText && associatedText.tagName === 'text') {
        associatedText.setAttributeNS(null, "x", newX + bbox.width/2);
        associatedText.setAttributeNS(null, "y", newY + bbox.height/2);
      }
    }
  }

  function endDrag() {
    if (selectedElement) {
      selectedElement.classList.remove('dragging');
    }
    isDragging = false;
    selectedElement = null;
  }

  function getMousePosition(evt) {
    const CTM = farmSvg.getScreenCTM();
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d
    };
  }

  // Add event listeners for drag functionality
  farmSvg.addEventListener('mousedown', startDrag);
  farmSvg.addEventListener('mousemove', drag);
  farmSvg.addEventListener('mouseup', endDrag);
  farmSvg.addEventListener('mouseleave', endDrag);

  // Add click handler for interactive elements
  farmSvg.addEventListener('click', (evt) => {
    if (!steps[currentStep].interactive) return;
    
    if (evt.target.classList.contains('clickable')) {
      evt.target.classList.toggle('highlighted');
      
      // Show temporary tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip fade-in';
      tooltip.textContent = evt.target.dataset.info || 'Área seleccionada';
      document.body.appendChild(tooltip);
      
      tooltip.style.left = `${evt.clientX}px`;
      tooltip.style.top = `${evt.clientY - 30}px`;
      
      setTimeout(() => tooltip.remove(), 2000);
    }
  });

  function updateButtons() {
    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === steps.length - 1;
  }

  function updateStep(step) {
    currentStep = step;
    speechBubble.classList.remove('fade-in');
    void speechBubble.offsetWidth;
    speechBubble.classList.add('fade-in');
    speechBubble.textContent = steps[step].speech;
    steps[step].action();
    updateButtons();
  }

  nextBtn.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
      updateStep(currentStep + 1);
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      updateStep(currentStep - 1);
    }
  });

  document.getElementById('restart').addEventListener('click', () => {
    updateStep(0);
  });

  function drawTeacher() {
    const avatar = `
      <g transform="translate(30, 40)">
        <!-- Science Flask Icon -->
        <path d="M40,20 L80,110 A20,20 0 0,0 100,130 L20,130 A20,20 0 0,0 40,110 Z" 
              fill="#4299e1" stroke="#2b6cb0" stroke-width="2"/>
        <path d="M50,20 L70,20 L70,40 L50,40 Z" 
              fill="#4299e1" stroke="#2b6cb0" stroke-width="2"/>
        <!-- Bubbles -->
        <circle cx="50" cy="90" r="5" fill="#63b3ed"/>
        <circle cx="70" cy="100" r="7" fill="#63b3ed"/>
        <circle cx="85" cy="85" r="4" fill="#63b3ed"/>
      </g>
    `;
    avatarSvg.innerHTML = avatar;
  }

  function createFarmPattern() {
    return `
      <defs>
        <pattern id="grass" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M0,50 Q25,30 50,50" fill="none" stroke="#2f855a" stroke-width="2"/>
          <path d="M0,45 Q25,25 50,45" fill="none" stroke="#2f855a" stroke-width="2"/>
        </pattern>
        <pattern id="crops" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M10,0 L10,20 M0,10 L20,10" stroke="#2f855a" stroke-width="1" opacity="0.5"/>
        </pattern>
      </defs>
    `;
  }

  function createAnimatedRect(x, y, width, height, fill, stroke, className = '') {
    const interactive = steps[currentStep].interactive ? 'draggable clickable' : '';
    return `
      <rect 
        x="${x}" y="${y}" 
        width="${width}" height="${height}" 
        fill="url(#grass)" 
        stroke="#2f855a" 
        stroke-width="2"
        class="${className} ${interactive} animated-line"
        data-info="Área: ${width * height / 25}m2"
      />
    `;
  }

  function drawInitialFarm() {
    const farm = `
      ${createFarmPattern()}
      ${createAnimatedRect(50, 50, 300, 200, 'none', '#2f855a')}
      <text x="200" y="150" text-anchor="middle" fill="#1a202c" class="fade-in clickable" data-info="Finca" font-weight="600">Finca</text>
    `;
    farmSvg.innerHTML = farm;
  }

  function highlightDimensions() {
    const farm = `
      ${createFarmPattern()}
      ${createAnimatedRect(50, 50, 300, 200, 'none', '#2f855a')}
      <line x1="50" y1="40" x2="350" y2="40" stroke="#2c5282" stroke-width="2" class="animated-line"/>
      <text x="200" y="35" text-anchor="middle" fill="#2c5282" class="fade-in clickable" data-info="12 metros" font-weight="600">12 metros</text>
      <line x1="40" y1="50" x2="40" y2="250" stroke="#2c5282" stroke-width="2" class="animated-line"/>
      <text x="35" y="150" text-anchor="middle" transform="rotate(-90,35,150)" fill="#2c5282" class="fade-in clickable" data-info="8 metros" font-weight="600">8 metros</text>
    `;
    farmSvg.innerHTML = farm;
  }

  function showAreaCalculation() {
    const farm = `
      ${createFarmPattern()}
      ${createAnimatedRect(50, 50, 300, 200, 'url(#grass)', '#2f855a')}
      <text x="200" y="150" text-anchor="middle" fill="#1a202c" class="fade-in clickable" data-info="Área Total: 96m2" font-weight="600">
        Área Total: 96 m<tspan baseline-shift="super" font-size="0.7em">2</tspan>
      </text>
      <text x="200" y="180" text-anchor="middle" fill="#1a202c" class="fade-in">
        12 m × 8 m = 96 m<tspan baseline-shift="super" font-size="0.7em">2</tspan>
      </text>
    `;
    farmSvg.innerHTML = farm;
  }

  function showFraction() {
    const farm = `
      ${createFarmPattern()}
      ${createAnimatedRect(50, 50, 300, 200, 'url(#grass)', '#2f855a')}
      <path d="M50,50 L350,250 M50,250 L350,50" stroke="#2c5282" stroke-width="1" class="animated-line"/>
      <rect 
        x="50" y="50" 
        width="150" 
        height="100" 
        fill="url(#crops)" 
        stroke="#ff0000" 
        stroke-width="3" 
        class="farm-element draggable clickable fade-in"
        data-info="Área para maíz: 24m2"
      />
      <text x="125" y="100" text-anchor="middle" fill="#1a202c" class="fade-in" font-weight="800" style="font-size: 1.2em">1/4 del área</text>
    `;
    farmSvg.innerHTML = farm;
  }

  function showFinalCalculation() {
    const farm = `
      ${createFarmPattern()}
      ${createAnimatedRect(50, 50, 300, 200, 'url(#grass)', '#2f855a')}
      <rect x="50" y="50" width="150" height="100" fill="url(#crops)" stroke="#ff0000" stroke-width="3" class="fade-in draggable"/>
      <text x="200" y="150" text-anchor="middle" fill="#1a202c" class="fade-in" font-weight="800">
        96 m<tspan baseline-shift="super" font-size="0.7em">2</tspan> ÷ 4 = 24 m<tspan baseline-shift="super" font-size="0.7em">2</tspan>
      </text>
    `;
    farmSvg.innerHTML = farm;
  }

  function highlightAnswer() {
    const farm = `
      ${createFarmPattern()}
      ${createAnimatedRect(50, 50, 300, 200, 'url(#grass)', '#2f855a')}
      <rect x="50" y="50" width="150" height="100" fill="url(#crops)" stroke="#ff0000" stroke-width="3" class="fade-in"/>
      <text x="200" y="140" text-anchor="middle" fill="#1a202c" class="fade-in" font-weight="800">
        24 m<tspan baseline-shift="super" font-size="0.7em">2</tspan>
      </text>
      <text x="200" y="170" text-anchor="middle" fill="#1a202c" class="fade-in clickable" data-info="¡Respuesta correcta!" font-weight="800">¡Respuesta correcta!</text>
    `;
    farmSvg.innerHTML = farm;
  }

  updateStep(0);
});