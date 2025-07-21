async function showModal(pokemonId) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  const pokemon = await fetchPokemon(pokemonId);

  const stats = {};
  pokemon.stats.forEach(stat => {
    stats[stat.stat.name] = stat.base_stat;
  });

modalContent.innerHTML = `
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
    <p>HP: ${pokemon.stats.find(s => s.stat.name === 'hp').base_stat}</p>
    <p>Angriff: ${pokemon.stats.find(s => s.stat.name === 'attack').base_stat}</p>
    <p>Verteidigung: ${pokemon.stats.find(s => s.stat.name === 'defense').base_stat}</p>
    <p>Spezial-Angriff: ${pokemon.stats.find(s => s.stat.name === 'special-attack').base_stat}</p>
    <p>Spezial-Verteidigung: ${pokemon.stats.find(s => s.stat.name === 'special-defense').base_stat}</p>
    <p>Initiative: ${pokemon.stats.find(s => s.stat.name === 'speed').base_stat}</p>
  </div>

  <div id="modal-evo" class="modal-section hidden">
    <p>Lade Evolutionsdaten...</p>
  </div>
`;


  modal.classList.remove('hidden');
}



function renderPokemonList(list) {
  const pokedex = document.getElementById('pokedex');
  pokedex.innerHTML = ''; 
  list.forEach(pokemon => {
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