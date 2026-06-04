import React from 'react';
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
  return (
    <div className={styles.card}>
      {product.image && (
        <img src={product.image} alt={product.name} className={styles.image} />
      )}
      <div className={styles.content}>
        <h3 className={styles.name}>{product.name || 'Unnamed Product'}</h3>
        {product.price && <p className={styles.price}>LKR {product.price}</p>}
        {product.description && (
          <p className={styles.description}>{product.description.substring(0, 80)}...</p>
        )}
      </div>
      <button className={styles.button}>Add to Cart</button>
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
