const LoadingButton = ({
  children,
  isLoading = false,
  loadingText = "Please wait",
  className = "",
  disabled,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`${className} relative inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-75`}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      <span>{isLoading ? loadingText : children}</span>
    </button>
  );
};

export default LoadingButton;
