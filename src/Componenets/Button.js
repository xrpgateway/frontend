export default ({ text, onClick }) => {
  return (
    <button
      className="transition-transform duration-200 ease-in-out bg-blue-500 hover:bg-blue-600 focus:outline-none rounded-full px-4 py-2 text-white shadow-md"
      onClick={onClick}
      onMouseDown={(e) =>
        e.currentTarget.classList.add("transform", "scale-95")
      }
      onMouseUp={(e) =>
        e.currentTarget.classList.remove("transform", "scale-95")
      }
    >
      {text}
    </button>
  );
};
