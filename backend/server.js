import express from 'express';
import cors from 'cors';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Permite a comunicação com o frontend e aumenta o limite de tamanho para suportar imagens em Base64
app.use(cors());
app.use(express.json({ limit: '10mb' })); 

// Configuração do cliente S3 para a Magalu Cloud
const s3 = new S3Client({
    region: process.env.MAGALU_REGION,
    endpoint: process.env.MAGALU_ENDPOINT,
    credentials: {
        accessKeyId: process.env.MAGALU_ACCESS_KEY,
        secretAccessKey: process.env.MAGALU_SECRET_KEY,
    },
    forcePathStyle: true // Necessário para storages compatíveis com S3
});

app.post('/upload', async (req, res) => {
    try {
        const { idDaFoto, imagemBase64 } = req.body;

        // Limpa o prefixo do Base64 e converte para Buffer (binário)
        const base64Data = Buffer.from(imagemBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const tipoExtensao = imagemBase64.split(';')[0].split('/')[1];
        const nomeFicheiro = `${idDaFoto}-${Date.now()}.${tipoExtensao}`;
        const nomeBucket = process.env.MAGALU_BUCKET_NAME;

        // Parâmetros de envio para o bucket
        const comandoParams = {
            Bucket: nomeBucket,
            Key: nomeFicheiro,
            Body: base64Data,
            ContentEncoding: 'base64',
            ContentType: `image/${tipoExtensao}`,
            ACL: 'public-read' // Torna a imagem pública para ser visualizada no álbum
        };

        await s3.send(new PutObjectCommand(comandoParams));

        // Constrói a URL pública final
        const urlPublica = `${process.env.MAGALU_ENDPOINT}/${nomeBucket}/${nomeFicheiro}`;
        
        res.status(200).json({ url: urlPublica });
    } catch (erro) {
        console.error("Erro no upload:", erro);
        res.status(500).json({ erro: 'Falha ao guardar a imagem na cloud.' });
    }
});

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
    console.log(`API a correr na porta ${PORTA}`);
});
