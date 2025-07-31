const loader = document.getElementById('loader-overlay');
const allLoadedPokemon = [];
let offset = 0;
const limit = 20;
let scrollYBeforeModal = 0;
let loadStart = 0;

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
    document.body.classList.remove('no-scroll');
    window.scrollTo(0, scrollYBeforeModal);
  }
}

async function loadPokemon() {
  const scrollPos = window.scrollY;
  showLoader();
  const newPokemon = [];
  for (let i = offset + 1; i <= offset + 20; i++) {
    try { newPokemon.push(await fetchPokemon(i)); } 
    catch (err) { console.error(`Fehler bei Pokémon ${i}`, err); }
  }
  allLoadedPokemon.push(...newPokemon);
  newPokemon.forEach(p => createCard(p));
  offset += 20;
  hideLoaderWithDelay(scrollPos);
}

function showLoader() {
  loader.style.display = 'flex';
  document.getElementById('pokedex').style.visibility = 'hidden';
  document.body.classList.add('no-scroll');
  loadStart = Date.now();
}

function hideLoaderWithDelay(scrollPos) {
  const delay = Math.max(0, 3000 - (Date.now() - loadStart));
  setTimeout(() => {
    loader.style.display = 'none';
    document.getElementById('pokedex').style.visibility = 'visible';
    document.body.classList.remove('no-scroll');
    window.scrollTo(0, scrollPos);
  }, delay);
}

function filterPokemon() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  renderPokemonList(allLoadedPokemon.filter(p => p.name.toLowerCase().includes(q)));
}

function switchTab(tab, id = null) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.modal-section').forEach(s => s.classList.add('hidden'));
  document.querySelector(`#modal-${tab}`).classList.remove('hidden');
  document.querySelector(`.modal-tab[onclick*="${tab}"]`).classList.add('active');
  if (tab === 'evo' && id) loadEvolutionChain(id);
}

async function loadEvolutionChain(id) {
  const evoContainer = document.getElementById('modal-evo');
  evoContainer.innerHTML = "<p style='color: white;'>Lade Evolutionskette...</p>";

  try {
    const evoUrl = (await (await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)).json()).evolution_chain.url;
    const chain = (await (await fetch(evoUrl)).json()).chain;
    const evoNames = getEvolutionNames(chain);

    const evoCards = await Promise.all(evoNames.map(async name => {
      const poke = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)).json();
      return `
        <div class="evo-card" onclick="showModal(${poke.id})">
          <img src="${poke.sprites.front_default}" alt="${poke.name}"><p style='color: white;'>${capitalize(poke.name)}</p>
        </div>`;
    }));

    evoContainer.innerHTML = `<div class="evo-chain">${evoCards.join('<span class="evo-arrow">→</span>')}</div>`;
  } catch (err) {
    evoContainer.innerHTML = "<p style='color: white;'>Konnte Evolutionsdaten nicht laden.</p>";
  }
}

function getEvolutionNames(chain) {
  const names = [];
  while (chain) {
    names.push(chain.species.name);
    chain = chain.evolves_to[0];
  }
  return names;
}


function navigatePokemon(direction) {
  const currentId = parseInt(
    document.querySelector('.modal-pokemon-card .card-header')
      .textContent.match(/#(\d+)/)[1]
  );

  const ids = allLoadedPokemon.map(p => p.id).sort((a, b) => a - b);
  let index = ids.indexOf(currentId);
  if (index === -1) return;

  index = (index + direction + ids.length) % ids.length;
  showModal(ids[index]);
}

