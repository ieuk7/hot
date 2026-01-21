export default async function handler(req, res) {
    // --- CONFIGURAÇÕES ---
    const API_TOKEN = 'sk_a689a20c480aee9372486cfc6ed7c349ecd7951ce3129f0236adff9a31ee42c7';
    const PRODUCT_HASH = 'prod_837135e3d0772e4f';
    const BASE_URL = 'https://multi.paradisepags.com/api/v1/transaction.php';

    // --- CABEÇALHOS CORS (Permite acesso de qualquer lugar) ---
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // --- FUNÇÕES GERADORAS (Aqui está a mágica) ---

    // 1. Gerador de CPF Válido (Algoritmo Mod11)
    function gerarCpf() {
        const randomiza = (n) => Math.round(Math.random() * n);
        const mod = (dividendo, divisor) => Math.round(dividendo - (Math.floor(dividendo / divisor) * divisor));

        const n1 = randomiza(9);
        const n2 = randomiza(9);
        const n3 = randomiza(9);
        const n4 = randomiza(9);
        const n5 = randomiza(9);
        const n6 = randomiza(9);
        const n7 = randomiza(9);
        const n8 = randomiza(9);
        const n9 = randomiza(9);

        let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
        d1 = 11 - (mod(d1, 11));
        if (d1 >= 10) d1 = 0;

        let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
        d2 = 11 - (mod(d2, 11));
        if (d2 >= 10) d2 = 0;

        return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
    }

    // 2. Listas de Nomes
    const nomes = [
        "Miguel", "Arthur", "Gael", "Heitor", "Theo", "Davi", "Gabriel", "Bernardo", "Samuel", "João",
        "Alice", "Sophia", "Laura", "Maitê", "Helena", "Valentina", "Maria", "Lívia", "Julia", "Antonella",
        "Pedro", "Lucas", "Matheus", "Rafael", "Gustavo", "Felipe", "Bruno", "Caio", "Enzo", "Leonardo",
        "Beatriz", "Mariana", "Ana", "Larissa", "Camila", "Letícia", "Amanda", "Fernanda", "Isabela", "Luana"
    ];

    const sobrenomes = [
        "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
        "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
        "Rocha", "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado", "Mendes", "Freitas",
        "Cardoso", "Ramos", "Gonçalves", "Santana", "Teixeira"
    ];

    const dominios = [
        "@gmail.com", "@hotmail.com", "@outlook.com", "@uol.com.br", "@terra.com.br", "@yahoo.com.br", "@live.com"
    ];

    // --- LÓGICA PRINCIPAL ---
    try {
        const { amount } = req.body;

        // Sorteia Nome e Sobrenome
        const nomeAleatorio = nomes[Math.floor(Math.random() * nomes.length)];
        const sobrenomeAleatorio = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
        const nomeCompleto = `${nomeAleatorio} ${sobrenomeAleatorio}`;

        // Gera Email baseado no nome + numero + dominio
        const numeroEmail = Math.floor(Math.random() * 9999) + 1; // 1 a 9999
        const dominioAleatorio = dominios[Math.floor(Math.random() * dominios.length)];
        // Remove acentos e deixa minusculo para o email
        const userEmail = (nomeAleatorio + sobrenomeAleatorio).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const emailFinal = `${userEmail}${numeroEmail}${dominioAleatorio}`;

        // Gera CPF e Telefone
        const cpfGerado = gerarCpf();
        const ddds = ["11", "21", "31", "41", "51", "61", "71", "81", "85", "62"];
        const ddd = ddds[Math.floor(Math.random() * ddds.length)];
        const telefoneGerado = ddd + "9" + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');

        console.log("Gerando pagamento para:", nomeCompleto, emailFinal, cpfGerado);

        const payload = {
            amount: parseInt(amount),
            description: "Acesso VIP Hot",
            productHash: PRODUCT_HASH,
            customer: {
                name: nomeCompleto,
                email: emailFinal,
                document: cpfGerado,
                phone: telefoneGerado
            }
        };

        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-Key': API_TOKEN
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro no gateway de pagamento');
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
