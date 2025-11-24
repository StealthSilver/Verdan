"use client";
import { Heart } from "lucide-react";
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
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
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
                width={200}
                height={40}
                priority
              />
            </a>
            <p className="max-w-xs opacity-70">
              Your smart companion for nurturing healthier, happier plants.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="transition-colors"
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
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="transition-colors"
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
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="transition-colors"
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
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm flex items-center gap-1 opacity-80">
            © {currentYear} Verdan.
          </p>
          <div className="flex gap-4">
            {["Twitter", "Instagram", "GitHub"].map((item) => (
              <a
                key={item}
                href="#"
                className="transition-colors"
                style={{ color: "#000000", opacity: 0.7 }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = VERDAN_GREEN)
                }
                onMouseLeave={(e) => (e.currentTarget.style.color = "#000000")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
