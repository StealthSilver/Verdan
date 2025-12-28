"use client";
import Image from "next/image";

const VERDAN_GREEN = "#48845C";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "About", href: "#about" },
      { name: "Pricing", href: "#" },
    ],
    company: [
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#connect" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
    ],
  };

  return (
    <footer
      className="w-full"
      id="footer"
      style={{ backgroundColor: "#ffffff", color: "#000000" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <a
              href="#"
              className="flex items-center gap-2 group"
              aria-label="Verdan Logo"
            >
              <Image
                src="/verdan_light.svg"
                alt="Verdan Logo"
                width={150}
                height={40}
                priority
                className="w-24 h-auto sm:w-32 md:w-40"
              />
            </a>
            <p className="max-w-xs text-sm sm:text-base opacity-70">
              Your smart companion for nurturing healthier, happier plants.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-heading font-medium mb-3 sm:mb-4 text-base sm:text-lg">
              Product
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="transition-colors text-sm sm:text-base"
                    style={{ color: "#000000", opacity: 0.7 }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = VERDAN_GREEN)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#000000")
                    }
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-heading font-medium mb-3 sm:mb-4 text-base sm:text-lg">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="transition-colors text-sm sm:text-base"
                    style={{ color: "#000000", opacity: 0.7 }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = VERDAN_GREEN)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#000000")
                    }
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-heading font-medium mb-3 sm:mb-4 text-base sm:text-lg">
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="transition-colors text-sm sm:text-base"
                    style={{ color: "#000000", opacity: 0.7 }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = VERDAN_GREEN)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#000000")
                    }
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm flex items-center gap-1 opacity-80 whitespace-nowrap">
            © {currentYear} Verdan.
          </p>
          <div className="flex gap-4 sm:gap-6 flex-wrap justify-center sm:justify-end">
            {[
              { name: "Twitter", href: "https://x.com/silver_srs" },
              {
                name: "GitHub",
                href: "https://github.com/StealthSilver/Verdan",
              },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors text-xs sm:text-sm"
                style={{ color: "#000000", opacity: 0.7 }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = VERDAN_GREEN)
                }
                onMouseLeave={(e) => (e.currentTarget.style.color = "#000000")}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
