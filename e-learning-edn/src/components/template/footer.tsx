"use client";
export default function Footer() {
  const iconClasses = "w-8 h-8 text-white";
  const socialLinks = [
    {
      href: "https://www.facebook.com/profile.php?id=61556130818833",
      icon: "/facebook.png",
    },
    {
      href: "https://www.linkedin.com/company/edn-%C3%A9cole-du-num%C3%A9rique/",
      icon: "/linkedin.png",
    },
    {
      href: "https://www.instagram.com/edn_ecoledunumerique/",
      icon: "/instagram.png",
    },
  ];

  return (
    <footer className="bg-gray-100 text-gray-700">
      <div className="container mx-auto px-4 py-6 flex flex-col gap-4 md:gap-0 md:flex-row items-center justify-between">
        {/* Mentions légales */}
        <div className="text-sm flex flex-col items-center md:flex-row">
          <span>Ecole Du Numérique</span>
          <span className="mx-2 hidden md:inline">|</span>
          <span className="mx-2 md:hidden">--</span>
          <a
            href="https://www.ecoledunumerique.re/mentions-legales/"
            className="font-bold">
            Mentions légales
          </a>
        </div>

        {/* Réseaux sociaux */}
        <ul className="flex space-x-4 mb-4 md:mb-0">
          {socialLinks.map((link, index) => (
            <li key={index}>
              <a href={link.href}>
                <img
                  src={link.icon}
                  alt={link.href}
                  className={iconClasses}
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
