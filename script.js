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
  document.body.classList.add('no-scroll');

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
  document.body.classList.remove('no-scroll');
}, remaining);
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
          <img src="${poke.sprites.other['official-artwork'].front_default}" alt="${poke.name}">
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