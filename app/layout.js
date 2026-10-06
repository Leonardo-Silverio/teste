import './globals.css';
import { nomeProduto } from '../desafio';

// Personalize o título e a descrição do navegador aqui.
export const metadata = {
  title: nomeProduto,
  description: 'Um espaço simples para analisar seu texto.',
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
