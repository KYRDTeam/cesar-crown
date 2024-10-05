import dynamic from 'next/dynamic';
import styles from '../styles/Home.module.css';

// Dynamically import the ImageEditor component with SSR disabled
const DynamicImageEditor = dynamic(() => import('../components/ImageEditor'), { ssr: false });

export default function Home() {
  return (
    <div className={styles.container}>
      <DynamicImageEditor />
    </div>
  );
}