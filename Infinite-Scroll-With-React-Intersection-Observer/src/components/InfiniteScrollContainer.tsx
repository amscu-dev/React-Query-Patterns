import { useInView } from "react-intersection-observer";

interface InfiniteScrollContainer {
  children: React.ReactNode;
  onBottomReached: () => void;
  className?: string;
}

function InfiniteScrollContainer({
  onBottomReached,
  className,
  children,
}: InfiniteScrollContainer) {
  const { ref } = useInView({
    rootMargin: "50px",
    onChange(inView, entry) {
      if (inView) {
        onBottomReached();
      }
    },
  });
  return (
    <div className={className}>
      {children}
      <div ref={ref}></div>
    </div>
  );
}

export default InfiniteScrollContainer;
