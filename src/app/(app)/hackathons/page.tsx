"use client";

import { useEffect, useState } from "react";
import { getAllHackathons } from "@/lib/firebase-services";
import { Hackathon } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar, MapPin, ExternalLink, Search } from "lucide-react";
import Image from "next/image";
import { useIsMobile } from "@/lib/responsive";
import {
  ResponsiveGrid,
  ResponsiveContainer,
} from "@/components/mobile-optimized-layout";
import { TouchFriendlyButton } from "@/components/mobile-optimized-layout";

export default function HackathonsPage() {
  const isMobile = useIsMobile();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Upcoming" | "Ongoing" | "Completed"
  >("All");

  useEffect(() => {
    async function fetchHackathons() {
      try {
        const data = await getAllHackathons();
        setHackathons(data);
      } catch (error) {
        console.error("Error fetching hackathons:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHackathons();
  }, []);

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || h.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ResponsiveContainer maxWidth="xl" padding="px-4 py-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <h1
              className={
                isMobile
                  ? "text-2xl font-bold font-headline mb-1 text-foreground"
                  : "text-4xl font-bold font-headline mb-2 text-foreground"
              }
            >
              Hackathons
            </h1>
            <p
              className={
                isMobile
                  ? "text-muted-foreground text-sm"
                  : "text-muted-foreground text-lg"
              }
            >
              Find your next challenge and build something amazing.
            </p>
          </div>
          <div className={isMobile ? "flex flex-wrap gap-2" : "flex gap-2"}>
            {["All", "Upcoming", "Ongoing", "Completed"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status as any)}
                className={
                  isMobile ? "text-xs px-3 py-2 h-auto" : "rounded-full"
                }
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className={`relative ${isMobile ? "w-full" : "max-w-xl"}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or organizer..."
            className={
              isMobile
                ? "pl-10 h-11 text-sm bg-background/50 backdrop-blur-sm border-primary/20"
                : "pl-10 h-12 text-lg bg-background/50 backdrop-blur-sm border-primary/20"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredHackathons.length === 0 ? (
          <div
            className={`text-center ${isMobile ? "py-12 px-4" : "py-20"} bg-white/5 backdrop-blur-md rounded-3xl border-2 border-dashed border-white/10`}
          >
            <p
              className={
                isMobile
                  ? "text-muted-foreground text-sm"
                  : "text-muted-foreground text-xl"
              }
            >
              No hackathons found matching your search.
            </p>
          </div>
        ) : (
          <ResponsiveGrid
            mobileColumns={1}
            tabletColumns={2}
            desktopColumns={3}
            gap="gap-6"
          >
            {filteredHackathons.map((h) => (
              <Card
                key={h.id}
                className="group overflow-hidden bg-white/20 dark:bg-black/20 backdrop-blur-md border-primary/10 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5"
              >
                <div
                  className={`relative w-full overflow-hidden ${isMobile ? "h-40" : "h-48"}`}
                >
                  <img
                    src={
                      h.image || `https://picsum.photos/seed/${h.id}/800/400`
                    }
                    alt={h.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-xs">
                    {h.status}
                  </Badge>
                </div>
                <CardHeader className={isMobile ? "p-3" : ""}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary line-clamp-1">
                      {h.organizer}
                    </span>
                  </div>
                  <CardTitle
                    className={`${isMobile ? "text-lg" : "text-2xl"} font-headline group-hover:text-primary transition-colors`}
                  >
                    {h.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-2 text-xs md:text-sm">
                    {h.description}
                  </CardDescription>
                </CardHeader>
                <CardContent
                  className={isMobile ? "space-y-3 p-3" : "space-y-4"}
                >
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">
                        {h.date?.toDate
                          ? h.date.toDate().toLocaleDateString()
                          : new Date(h.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{h.location}</span>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-2 group">
                    <a
                      href={h.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Join Hackathon{" "}
                      <ExternalLink className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        )}
      </div>
    </ResponsiveContainer>
  );
}
