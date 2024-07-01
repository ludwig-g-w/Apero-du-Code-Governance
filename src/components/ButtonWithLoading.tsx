import { Button } from "./ui/button";



function ButtonWithLoading({ children, loading }) {
  return (
    <Button

    >
      <p className="text-3xl tracking-wide z-10">
        {children}
      </p>
      {loading && (
        <ReloadIcon className="h-5 w-5 text-white animate-spin" />
      )}
    </Butt>
  );
}