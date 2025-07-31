async function showModal(pokemonId) {
  scrollYBeforeModal = window.scrollY; // vor jeglicher DOM-Manipulation sichern
  document.body.classList.add('no-scroll');

  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  const pokemon = await fetchPokemon(pokemonId);

  const stats = {};
  pokemon.stats.forEach(stat => stats[stat.stat.name] = stat.base_stat);

  modal.classList.remove('hidden'); // Modal anzeigen, aber Inhalt erst danach schreiben

  // Verzögertes Einfügen, um Layout-Shift zu vermeiden
  requestAnimationFrame(() => {

  modalContent.innerHTML = `
  <div class="modal-nav">
  <button class="nav-arrow left" onclick="navigatePokemon(-1)">←</button>
  <button class="nav-arrow right" onclick="navigatePokemon(1)">→</button>
</div>
    <div class="modal-pokemon-card ${getTypeClass(pokemon.types[0].type.name)}">
      <div class="card-header">#${pokemon.id} ${capitalize(pokemon.name)}</div>
      <div class="card-image">
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
      </div>
      <div class="card-footer">
        ${pokemon.types.map(t => `
          <div class="type-icon type-${t.type.name}">
            <img 
              src="https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${t.type.name}.svg" 
              alt="${t.type.name}" 
              class="type-icon-img"
            >
          </div>
        `).join("")}
      </div>
    </div>

    <div class="modal-tabs">
      <button class="modal-tab active" onclick="switchTab('main')">Main Informations</button>
      <button class="modal-tab" onclick="switchTab('stats')">Stats</button>
      <button class="modal-tab" onclick="switchTab('evo', ${pokemon.id})">Evo Chain</button>
    </div>

    <div id="modal-main" class="modal-section">
      <p><strong>Typ:</strong> ${pokemon.types.map(t => capitalize(t.type.name)).join(', ')}</p>
      <p><strong>Größe:</strong> ${pokemon.height / 10} m</p>
      <p><strong>Gewicht:</strong> ${pokemon.weight / 10} kg</p>
      <p><strong>Fähigkeiten:</strong> ${pokemon.abilities.map(a => capitalize(a.ability.name)).join(', ')}</p>
    </div>

    <div id="modal-stats" class="modal-section hidden">
      <p>HP: ${stats.hp}</p>
      <p>Angriff: ${stats.attack}</p>
      <p>Verteidigung: ${stats.defense}</p>
      <p>Spezial-Angriff: ${stats['special-attack']}</p>
      <p>Spezial-Verteidigung: ${stats['special-defense']}</p>
      <p>Initiative: ${stats.speed}</p>
    </div>

    <div id="modal-evo" class="modal-section hidden">
      <p style="color: white">Lade Evolutionsdaten...</p>
    </div>
  `;

  modal.classList.remove('hidden');
  });
}


function createCard(pokemon) {
  const pokedex = document.getElementById('pokedex');
  const types = pokemon.types.map(t => t.type.name);
  const mainType = types[0];

  const card = document.createElement('div');
  card.className = `pokemon-card ${getTypeClass(mainType)}`;
  card.setAttribute("onclick", `showModal(${pokemon.id})`);

  const typeIconsHTML = types
    .map(t => `
      <div class="type-icon type-${t}">
        <img 
          src="https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${t}.svg" 
          alt="${t}" 
          class="type-icon-img"
        >
      </div>
    `)
    .join("");

  card.innerHTML = `
    <div class="card-header">#${pokemon.id} ${capitalize(pokemon.name)}</div>
    <div class="card-image">
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    </div>
    <div class="card-footer">${typeIconsHTML}</div>
  `;

  pokedex.appendChild(card);
}