async function compararPokemon() {
    try {
        const idPokemon1 = document.getElementById('pokemon1').value;
        const idPokemon2 = document.getElementById('pokemon2').value;

        const pokemon1 = await obtenerPokemon(idPokemon1);
        const pokemon2 = await obtenerPokemon(idPokemon2);

        const resultados = document.getElementById('resultados');
        resultados.innerHTML = "";

        if (pokemon1 && pokemon2) {
            mostrarDatos(pokemon1, resultados);
            mostrarDatos(pokemon2, resultados);
            compararEstadisticas(pokemon1, pokemon2, resultados);
        } else {
            resultados.innerHTML = "<p>No se pudo obtener información de uno o ambos Pokémon</p>";
        }
    } catch (error) {
        console.error("Error al comparar Pokémon:", error);
    }
}

function mostrarDatos(pokemon, contenedor) {
    const info = document.createElement('div');
    info.classList.add('pokemon-info');

    const listaStats = document.createElement('ul');
    listaStats.classList.add('lista-stats');

    for (let i = 0; i < pokemon.stats.length; i++) {
        const statItem = document.createElement('li');
        statItem.textContent = `${pokemon.stats[i].name}: ${pokemon.stats[i].base_stat}`;
        listaStats.appendChild(statItem);
    }

    info.innerHTML = `
        <h3>${pokemon.nombre}</h3>
        <img src="${pokemon.imagen}" alt="${pokemon.nombre}">
        <p><strong>ID:</strong> ${pokemon.id}</p>
        <p><strong>IV:</strong> ${pokemon.iv}</p>
        <p><strong>EV:</strong> ${pokemon.ev}</p>
        <p><strong>Habilidad:</strong> ${pokemon.habilidad}</p>
        <p><strong>Estadísticas base:</strong></p>`;

    info.appendChild(listaStats);
    contenedor.appendChild(info);
}

async function obtenerPokemon(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();

        const pokemonInfo = {
            id: data.id,
            nombre: data.name,
            imagen: data.sprites.front_default,
            iv: data.stats[0].base_stat,
            ev: data.stats[1].base_stat,
            habilidad: data.abilities[0].ability.name,
            stats: []
        };

        for (let i = 0; i < data.stats.length; i++) {
            pokemonInfo.stats.push({ name: data.stats[i].stat.name, base_stat: data.stats[i].base_stat });
        }

        return pokemonInfo;
    } catch (error) {
        console.error("Error al obtener información del Pokémon:", error);
        return null;
    }
}

function compararEstadisticas(pokemon1, pokemon2, container) {
    const comparacionDiv = document.createElement('div');
    comparacionDiv.classList.add('pokemon-info', 'comparar-info');
    comparacionDiv.innerHTML = `<h3>Comparación de Estadísticas</h3>`;

    compararStat("IV", pokemon1.iv, pokemon2.iv, comparacionDiv);
    compararStat("EV", pokemon1.ev, pokemon2.ev, comparacionDiv);

    const statsNombres = ['attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    for (let i = 0; i < statsNombres.length; i++) {
        const statNombre = statsNombres[i];
        compararStat(statNombre, pokemon1.stats.find(stat => stat.name === statNombre).base_stat, pokemon2.stats.find(stat => stat.name === statNombre).base_stat, comparacionDiv);
    }

    const puntuacionPokemon1 = calcularPuntuacionTotal(pokemon1);
    const puntuacionPokemon2 = calcularPuntuacionTotal(pokemon2);

    let mensaje = "Empate en términos generales";

    if (puntuacionPokemon1 > puntuacionPokemon2) {
        mensaje = `Gana Pokémon 1 en términos generales`;
    } else if (puntuacionPokemon1 < puntuacionPokemon2) {
        mensaje = `Gana Pokémon 2 en términos generales`;
    }

    comparacionDiv.innerHTML += `<p>${mensaje}</p>`;

    container.appendChild(comparacionDiv);
}

function compararStat(statNombre, statPokemon1, statPokemon2, container) {
    const diferencia = statPokemon1 - statPokemon2;
    let mensaje = `${statNombre}: ${statPokemon1} vs ${statPokemon2} (Empate)`;

    if (diferencia > 0) {
        mensaje = `${statNombre}: ${statPokemon1} vs ${statPokemon2} (Gana Pokémon 1)`;
    } else if (diferencia < 0) {
        mensaje = `${statNombre}: ${statPokemon1} vs ${statPokemon2} (Gana Pokémon 2)`;
    }

    container.innerHTML += `<p>${mensaje}</p>`;
}

function calcularPuntuacionTotal(pokemon) {
    let statsTotal = 0;
    for (let i = 0; i < pokemon.stats.length; i++) {
        statsTotal += pokemon.stats[i].base_stat;
    }
    return pokemon.iv + pokemon.ev + statsTotal;
}
