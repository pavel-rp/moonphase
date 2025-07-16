import { GridItem } from "@/components/ui/grid";
import { Grid } from "@/components/ui/grid";
import LoadingCard from "../card/LoadingCard";

export default function ShimmerGrid({ size }: { size: number }) {
  return (
    <Grid className="w-full max-w-7xl mx-auto">
      {Array.from({ length: size }, (_, i) => i).map((i) => (
        <GridItem span={i === 0 ? 2 : 1} key={i}>
          <LoadingCard />
        </GridItem>
      ))}
    </Grid>
  );
}
