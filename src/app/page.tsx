import Link from 'next/link'

export default function Home() {
  return (
    <div className="landing-container">

      {/* HEADER */}
      <header className="landing-header">
        <div className="logo">Radar M</div>
        <div className="header-links">
          <a href="#como-funciona">Como funciona</a>
          <a href="#para-quem">Para quem</a>
          <a href="/login">Entrar</a>
        </div>
      </header>

      {/* HERO */}
      <section className="landing-section">
        <div className="landing-center">
          <h1 className="hero-title">
            Controle manutenções. Evite falhas. Mantenha tudo funcionando.
          </h1>

          <p className="hero-subtitle">
            O Radar M ajuda profissionais e empresas a acompanhar manutenções
            de equipamentos e evitar problemas antes que eles aconteçam.
          </p>

          <Link href="/signup" className="btn-primary-large">
            Começar agora
          </Link>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="landing-section section-gray">
        <div className="landing-center">
          <h2>Equipamentos quebrando por falta de controle?</h2>
          <p>
            Manutenções esquecidas, equipamentos parados e prejuízos evitáveis.
            O Radar M mostra o que está atrasado e o que precisa de atenção.
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="landing-section">
        <div className="landing-center">
          <h2>Como funciona</h2>

          <div className="grid-3">

            <div>
              <h3>1. Cadastre seus equipamentos</h3>
              <p>Registre máquinas, ferramentas ou veículos.</p>
            </div>

            <div>
              <h3>2. Defina as manutenções</h3>
              <p>Informe periodicidade ou próxima revisão.</p>
            </div>

            <div>
              <h3>3. Veja o que precisa de atenção</h3>
              <p>O sistema mostra manutenções atrasadas ou próximas.</p>
            </div>

          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section id="para-quem" className="landing-section section-gray">
        <div className="landing-center">
          <h2>Feito para quem depende de equipamentos</h2>

          <div className="grid-3">

            <div>
              <h3>Oficinas e técnicos</h3>
              <p>Controle revisões e manutenções com facilidade.</p>
            </div>

            <div>
              <h3>Pequenas empresas</h3>
              <p>Evite paradas inesperadas em equipamentos.</p>
            </div>

            <div>
              <h3>Profissionais autônomos</h3>
              <p>Mantenha ferramentas e máquinas sempre prontas.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="landing-section section-dark">
        <div className="landing-center">
          <h2>Evite falhas e mantenha seus equipamentos sob controle</h2>
          <br />

          <Link href="/signup" className="btn-outline-light">
            Criar conta gratuita
          </Link>

        </div>
      </section>

    </div>
  );
}
