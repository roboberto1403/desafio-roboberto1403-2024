// Importando os arquivos JSON
import recintos from '../dados/recintos.json' with { type: 'json' };
import animais from '../dados/animais.json' with { type: 'json' };

class RecintosZoo {

    constructor() {
        this.recintos = recintos;
        this.animais = animais;
    }

    analisaRecintos(animal, quantidade) {
        const recintosViaveis = [];
        const recintosData = recintos; 
        const animaisData = animais; 

        if (quantidade == 0){
            return { erro: "Quantidade inválida" };
        }
        // Verificar se o animal é válido antes de processar os recintos
        const animalData = animaisData.find(a => a.especie === animal);

        if (!animalData) {
            // Retorna um erro se o animal não for encontrado
            return { erro: "Animal inválido" };
        }

         // Mapeia a espécie ao espaço ocupado
         const espacoOcupadoPorEspecie = animaisData.reduce((map, a) => {
            map[a.especie] = a.tamanho;
            return map;
        }, {});

        // Mapeia a espécie ao seu hábito alimentar
        const habitoAlimentarPorEspecie = animaisData.reduce((map, a) => {
            map[a.especie] = a.habito_alimentar;
            return map;
        }, {});

         // Processar recintos
         recintosData.forEach(recinto => {
            // Calcular espaço já ocupado no recinto
            const espacoOcupadoAtual = recinto.animais_existentes.reduce((total, especie) => {
                return total + (espacoOcupadoPorEspecie[especie] || 0);
            }, 0);

            // Obtenha o número de espécies únicas no recinto
            const especiesUnicas = new Set(recinto.animais_existentes);
            const numeroDeEspecies = especiesUnicas.size;

            // Adicione um espaço extra se houver mais de uma espécie única no recinto
            const espacoExtra = numeroDeEspecies > 1 ? 1 : 0;

           // Verificar se há algum carnívoro no recinto
            const temCarnivoro = recinto.animais_existentes.some(especie => 
            habitoAlimentarPorEspecie[especie] === "carnivoro");

            // Calcular espaço disponível
            let espacoDisponivel = recinto.tamanho_total - espacoOcupadoAtual - espacoExtra;

            let espacoNecessario = animalData.tamanho * quantidade;
            const total = recinto.tamanho_total;
            if (espacoDisponivel >= espacoNecessario) {
                // Verifica se o bioma do recinto é compatível com o animal
                if (animalData.bioma.some(item => recinto.bioma.includes(item))){
                     // Caso o animal seja carnívoro, certifica que só irá habitar com sua própria espécie
                    if (animalData.habito_alimentar === "carnivoro") {
                        if (recinto.animais_existentes.includes(animalData.especie) || recinto.animais_existentes.length === 0) {
                            recintosViaveis.push("Recinto " + recinto.numero + " (espaço livre: " + (espacoDisponivel - (animalData.tamanho * quantidade)) + " total: " + total+")")
                        }
                    }else{
                        // Caso não seja carnívoro, verifica se há outros carnívoros no recinto
                        if (!temCarnivoro){
                            // Caso não já tiver múltiplas espécies no recinto, verifica se iram existir com a adição do novo animal
                            if(espacoExtra === 0)
                                {espacoNecessario, espacoDisponivel = this.multiplasEspecies(recinto, animal, espacoNecessario, espacoDisponivel)} 
                             // Verifica novamente se há espaço suficiente após considerar múltiplas espécies
                            if (espacoDisponivel >= espacoNecessario){
                                if (!(animal === "HIPOPOTAMO")){
                                    // Regra do hipopótamo para o caso de um animal entrando num recinto com algum presente
                                    if (!(recinto.animais_existentes.includes("HIPOPOTAMO") && !(recinto.bioma.includes("savana") && recinto.bioma.includes("rio")))) {
                                        // Regra do macaco
                                        if (!(animalData.especie === "MACACO" && (recinto.animais_existentes.length === 0 && quantidade === 1))){
                                            recintosViaveis.push("Recinto " + recinto.numero + " (espaço livre: " + (espacoDisponivel - (animalData.tamanho * quantidade)) + " total: " + total+")")  
                                        }
                                    }
                                // Regra do hipopótamo para o caso de um hipopótamo entrando num recinto  
                                }else{
                                    if(recinto.animais_existentes.length === 0 || (recinto.bioma.includes("savana") && recinto.bioma.includes("rio"))){
                                        recintosViaveis.push("Recinto " + recinto.numero + " (espaço livre: " + (espacoDisponivel - (animalData.tamanho * quantidade)) + " total: " + total+")")
                                    } 
                            } 
                        }     
                    }  
                }  
            }
        }});

        if (recintosViaveis.length > 0) {
            return { recintosViaveis: recintosViaveis };
        }
        return { erro: "Não há recinto viável" };
    }
    // Função para ajustar o espaço necessário e disponível quando existirão múltiplas espécies no recinto
    multiplasEspecies(recinto, animal, espacoNecessario, espacoDisponivel) {
        let n = animal
        let v = false;

        if (recinto.animais_existentes.length > 0){
            for (let i of recinto.animais_existentes) {
                if (i !== n) {
                    v = true;
                    break;
                }
            }
        }

        if(v){
            espacoNecessario += 1;
            espacoDisponivel -= 1;
        }
        return espacoNecessario, espacoDisponivel;
    }
}

export { RecintosZoo as RecintosZoo };