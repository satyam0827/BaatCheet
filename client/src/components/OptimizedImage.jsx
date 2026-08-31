import { useEffect, useState } from "react";

const OptimizedImage = ({
  src,
  alt,
  className = "",
  fallbackSrc = "/profile.png",
  loading = "lazy",
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setImageSrc(src || fallbackSrc);
    setIsLoaded(false);
  }, [src, fallbackSrc]);

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      className={`${className} ${isLoaded ? "opacity-100" : "opacity-80"} transition-opacity duration-200`}
      onLoad={() => setIsLoaded(true)}
      onError={() => setImageSrc(fallbackSrc)}
    />
  );
};

export default OptimizedImage;
