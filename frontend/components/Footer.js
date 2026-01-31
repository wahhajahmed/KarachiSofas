export default function Footer() {
  return (
    <footer className="bg-black/60 border-t border-primary/40 mt-16">
      <div className="container-max py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
        <p>© {new Date().getFullYear()} AUF Karachi Sofas. All rights reserved.</p>
        <p>Karachi, Pakistan · Cash on Delivery & Bank Transfer available.</p>
      </div>
    </footer>
  );
}
