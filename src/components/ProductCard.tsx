"use client";

import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useI18n } from '@/lib/i18n';
import styles from './ProductCard.module.css';

interface Product {
  id?: string;
  name?: string;
  price?: string | number;
  image?: string;
  url?: string;
  description?: string;
  [key: string]: any; // Allow other dynamic fields
}

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, isInCart } = useCart();
  const { t } = useI18n();
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const inCart = product.id ? isInCart(product.id) : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.id || !product.name) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      image: product.image,
      url: product.url,
    });

    setJustAdded(true);
  };

  // Reset "just added" animation after 1.5s
  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

  return (
    <div className={styles.card} onClick={() => product.url && window.open(product.url, '_blank')}>
      {product.image && !imgError && (
        <img 
          src={product.image} 
          alt={product.name} 
          className={styles.image} 
          onError={() => setImgError(true)} 
        />
      )}
      <div className={styles.content}>
        <h3 className={styles.name}>{product.name || 'Unnamed Product'}</h3>
        {product.price && <p className={styles.price}>{t("general.lkr")} {product.price}</p>}
        {product.description && (
          <p className={styles.description}>{product.description.substring(0, 80)}...</p>
        )}
      </div>
      <button
        className={`${styles.button} ${inCart ? styles.buttonInCart : ""} ${justAdded ? styles.buttonAdded : ""}`}
        onClick={handleAddToCart}
      >
        {inCart ? (
          <>
            <Check size={14} strokeWidth={2.5} />
            <span>{t("product.inCart")}</span>
          </>
        ) : (
          t("product.addToCart")
        )}
      </button>
    </div>
  );
};

export const ProductCarousel = ({ products }: { products: Product[] }) => {
  if (!products || !Array.isArray(products) || products.length === 0) return null;
  
  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carouselScroll}>
        {products.map((p, i) => (
          <ProductCard key={p.id || i} product={p} />
        ))}
      </div>
    </div>
  );
};
