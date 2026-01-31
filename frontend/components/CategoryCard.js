import Link from 'next/link';

export default function CategoryCard({ category }) {
  return (
    <Link href={`/category/${category.id}`} className="block">
      <div className="bg-secondary/60 border border-primary/40 rounded-xl p-4 hover:border-primary hover:-translate-y-1 transition transform shadow-lg">
        <h3 className="text-lg font-semibold text-primary mb-1">{category.name}</h3>
        <p className="text-xs text-gray-300">Explore premium {category.name} from AUF Karachi Sofas.</p>
      </div>
    </Link>
  );
}
