import './globals.css';

// Personalize o título e a descrição do navegador aqui.
export const metadata = {
  title: 'Detetive da Vó',
  description: 'Um espaço simples para analisar seu texto.',
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
