export default async function handler(req, res) {
    // Configurações do seu Gateway (Peguei do seu código PHP)
    const API_TOKEN = 'sk_a689a20c480aee9372486cfc6ed7c349ecd7951ce3129f0236adff9a31ee42c7';
    const PRODUCT_HASH = 'prod_837135e3d0772e4f';
    const BASE_URL = 'https://multi.paradisepags.com/api/v1/transaction.php';

    // Permite CORS (para o front chamar o back sem bloqueio)
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

    try {
        const { amount, customerName, customerEmail, customerPhone, customerDoc } = req.body;

        // Gera dados fake se não vier do front (para manter o anonimato que você queria)
        const fakePhone = "119" + Math.floor(Math.random() * 100000000);
        const fakeDoc = "00000000000"; // CPF Genérico ou use gerador se a API exigir validação real

        const payload = {
            amount: parseInt(amount), // Valor em centavos
            description: "Acesso VIP Hot",
            productHash: PRODUCT_HASH,
            customer: {
                name: customerName || "Cliente VIP",
                email: customerEmail || "vendas@vip.com",
                document: customerDoc || fakeDoc,
                phone: customerPhone || fakePhone
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

