import Link from 'next/link';

export default function CategoryCard({ category }) {
  return (
    <Link href={`/category/${category.id}`} className="block group">
      <div className="card p-8 hover:border-primary hover:scale-105 transition-all duration-300 h-full">
        <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-primary-dark transition-colors">{category.name}</h3>
        <p className="text-base text-gray-300 leading-relaxed">Explore premium {category.name} from AUF Karachi Sofas.</p>
      </div>
    </Link>
  );
}
