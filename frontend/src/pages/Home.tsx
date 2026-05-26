import { Hero } from '@/components/home/Hero';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import { Services } from '@/components/home/Services';
import { About } from '@/components/home/About';
import { Contact } from '@/components/home/Contact';
import { motion } from 'framer-motion';
import { useSiteContent } from '@/hooks/useSiteContent';

export const Home = () => {
  const { content } = useSiteContent();
  const generalContent = content.general || {};
  const siteName = generalContent.siteName || 'Rona Studio';
  const copyrightText = generalContent.copyrightText || `© ${new Date().getFullYear()} Rona Studio. All rights reserved.`;

  return (
    <main>
      <Hero />
      <PortfolioGrid />
      <Services />
      <About />
      <Contact />
      
      {/* Dynamic Footer with General Content */}
      <footer className="bg-primary-dark py-8 border-t border-primary-yellow/10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Site Name and Copyright */}
            <div className="text-center">
              <h3 className="text-xl font-display font-bold text-primary-yellow mb-2">
                {siteName}
              </h3>
              <p className="text-sm text-white/60">
                {copyrightText}
              </p>
            </div>

            {/* Built by Miqrotek */}
            <div className="text-center pt-4 border-t border-white/10">
              <a
                href="https://portfolio-sooty-eight-54.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary-yellow 
                           transition-colors duration-300 group"
              >
                <span>Built by</span>
                <span className="font-semibold group-hover:underline">Miqrotek</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </footer>
    </main>
  );
};
