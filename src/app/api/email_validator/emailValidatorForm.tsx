"use client";

export default function EmailValidatorForm() {
  const handleSubmit = () => {
    console.log("handle submit");
  };
  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-16 max-w-xl sm:mt-20">
      <label
        htmlFor="email"
        className="block text-sm font-semibold leading-6 text-white"
      >
        Email
      </label>
      <div className="mt-2.5">
        <input
          type="text"
          name="email"
          id="email"
          autoComplete="given-name"
          className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
      </div>
      <div className="mt-10">
        <button
          type="submit"
          className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Verify Email
        </button>
      </div>
    </form>
  );
}
