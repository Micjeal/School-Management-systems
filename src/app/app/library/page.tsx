import Link from "next/link";
import { requireUserContext } from "@/lib/auth/context";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, ArrowRight } from "lucide-react";

export default async function Library() {
  const c = await requireUserContext("library.read");

  return (
    <PageContainer>
      <PageHeader
        title="Library"
        description="Manage catalogue, circulation, members, and reservations."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/app/library/circulation">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-6">
              <BookOpen className="mb-3 h-8 w-8 text-blue-600" />
              <h3 className="font-semibold">Circulation</h3>
              <p className="mt-2 text-sm text-slate-500">
                Issue items, track loans, process returns
              </p>
              <ArrowRight className="mt-4 h-4 w-4 text-slate-400" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/library/catalogue">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-6">
              <BookOpen className="mb-3 h-8 w-8 text-green-600" />
              <h3 className="font-semibold">Catalogue</h3>
              <p className="mt-2 text-sm text-slate-500">
                Browse and manage library items
              </p>
              <ArrowRight className="mt-4 h-4 w-4 text-slate-400" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/library/members">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-6">
              <Users className="mb-3 h-8 w-8 text-purple-600" />
              <h3 className="font-semibold">Members</h3>
              <p className="mt-2 text-sm text-slate-500">
                Manage library membership
              </p>
              <ArrowRight className="mt-4 h-4 w-4 text-slate-400" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/library/reservations">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-6">
              <Clock className="mb-3 h-8 w-8 text-orange-600" />
              <h3 className="font-semibold">Reservations</h3>
              <p className="mt-2 text-sm text-slate-500">
                Manage item reservations
              </p>
              <ArrowRight className="mt-4 h-4 w-4 text-slate-400" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
}
