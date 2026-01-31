export default function Footer() {
  return (
    <footer className="bg-black/70 border-t border-primary/40 mt-20">
      <div className="container-max py-8 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 space-y-2 sm:space-y-0">
        <p className="font-medium">© {new Date().getFullYear()} AUF Karachi Sofas. All rights reserved.</p>
        <p>Karachi, Pakistan · Cash on Delivery & Bank Transfer available.</p>
      </div>
    </footer>
  );
}
