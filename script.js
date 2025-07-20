const loader = document.getElementById('loader-overlay');
const allLoadedPokemon = [];
let offset = 0;
const limit = 20;

function getTypeClass(type) {
  return `type-${type}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fetchPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return await res.json();
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
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
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

function hideModal(event) {
  if (event.target.id === "modal") {
    document.getElementById('modal').classList.add('hidden');
  }
}

async function loadPokemon() {
  const loader = document.getElementById('loader-overlay');
  const pokedex = document.getElementById('pokedex');

  loader.style.display = 'flex';        
  pokedex.style.visibility = 'hidden';  

  const loadStart = Date.now();
  const newPokemon = [];

  for (let i = offset + 1; i <= offset + 20; i++) {
    try {
      const data = await fetchPokemon(i);
      newPokemon.push(data);
    } catch (err) {
      console.error(`Fehler bei Pokémon ${i}`, err);
    }
  }

  allLoadedPokemon.push(...newPokemon);
  renderPokemonList(allLoadedPokemon);
  offset += 20;

  const elapsed = Date.now() - loadStart;
  const remaining = Math.max(0, 3000 - elapsed);

  setTimeout(() => {
    loader.style.display = 'none';         
    pokedex.style.visibility = 'visible';   
  }, remaining);
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

function filterPokemon() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allLoadedPokemon.filter(p =>
    p.name.toLowerCase().includes(query)
  );
  renderPokemonList(filtered);
}


function switchTab(tab, pokemonId = null) {
  const tabs = document.querySelectorAll('.modal-tab');
  tabs.forEach(t => t.classList.remove('active'));

  const sections = document.querySelectorAll('.modal-section');
  sections.forEach(s => s.classList.add('hidden'));

  document.querySelector(`#modal-${tab}`).classList.remove('hidden');
  document.querySelector(`.modal-tab[onclick*="${tab}"]`).classList.add('active');

  if (tab === 'evo' && pokemonId) {
    loadEvolutionChain(pokemonId);
  }
}


async function loadEvolutionChain(pokemonId) {
  const evoContainer = document.getElementById('modal-evo');
  evoContainer.innerHTML = "<p>Lade Evolutionskette...</p>";

  try {
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
    const speciesData = await speciesRes.json();
    const evoUrl = speciesData.evolution_chain.url;

    const evoRes = await fetch(evoUrl);
    const evoData = await evoRes.json();

    const evoList = [];
    let current = evoData.chain;

    while (current) {
      evoList.push(current.species.name);
      current = current.evolves_to[0];
    }

    const evoCards = await Promise.all(evoList.map(async name => {
      const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const poke = await pokeRes.json();
      return `
        <div class="evo-card" onclick="showModal(${poke.id})">
          <img src="${poke.sprites.front_default}" alt="${poke.name}">
          <p>${capitalize(poke.name)}</p>
        </div>
      `;
    }));

    evoContainer.innerHTML = `<div class="evo-chain">${evoCards.join('<span class="evo-arrow">→</span>')}</div>`;
  } catch (err) {
    console.error("Fehler beim Laden der Evolutionskette:", err);
    evoContainer.innerHTML = "<p>Konnte Evolutionsdaten nicht laden.</p>";
  }
}