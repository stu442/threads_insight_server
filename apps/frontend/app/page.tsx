import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Sparkles,
  Tags,
  Workflow,
  Github,
  ArrowRight,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Linkedin,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight">CIAS</span>
          <Button asChild size="sm">
            <Link href="/dashboard">로그인</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute right-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-emerald-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <Badge variant="secondary" className="mb-6">
            Content Analytics for Threads
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            CIAS
            <span className="block text-muted-foreground">콘텐츠 인사이트 자동화 시스템</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Threads 콘텐츠를 더 똑똑하게 분석하고 인사이트를 자동화하세요. AI 기반 분석으로 데이터에 근거한 결정을
            내릴 수 있습니다.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">
                시작하기 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">자세히 보기</Link>
            </Button>
          </div>
          <p className="mt-16 text-sm text-muted-foreground">자동화를 기반으로, 크리에이터를 위해 설계되었습니다.</p>
        </div>
      </section>

      {/* Feature 1: Automated Thread Analytics */}
      <section id="features" className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-700">
                <BarChart3 className="h-4 w-4" />
                자동 분석
              </div>
              <h2 className="text-3xl font-bold tracking-tight">자동화된 Threads 분석</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                CIAS가 Threads 지표를 자동으로 수집, 정리, 분석합니다. 수동 입력은 필요 없으며 연결만 하면 시스템이
                알아서 처리합니다.
              </p>
              <ul className="mt-6 space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  실시간 지표 수집
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  과거 추세 추적
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  성과 벤치마킹
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium">지표 개요</span>
                <Badge variant="secondary">실시간</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard icon={Eye} label="조회수" value="12.4K" trend="+12%" />
                <MetricCard icon={Heart} label="좋아요" value="2.8K" trend="+8%" />
                <MetricCard icon={MessageCircle} label="답글" value="456" trend="+24%" />
                <MetricCard icon={TrendingUp} label="도달" value="45.2K" trend="+15%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Smart Insight Summaries */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium">주간 인사이트</span>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">최고 성과:</strong> "productivity tips" 스레드가 평균 대비 3배
                      더 많은 반응을 얻었습니다.
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">최적 시간:</strong> KST 오전 9시에 올린 글이 40% 더 높은 도달률을
                      보였습니다.
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">추천:</strong> 더 캐주얼한 톤의 게시물이 답글을 2배까지 늘립니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-700">
                <Sparkles className="h-4 w-4" />
                인사이트 요약
              </div>
              <h2 className="text-3xl font-bold tracking-tight">스마트 인사이트 요약</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                CIAS가 AI로 주간 인사이트를 요약해 제공합니다. 데이터를 일일이 보지 않아도 바로 실행 가능한
                제안을 받을 수 있습니다.
              </p>
              <ul className="mt-6 space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  AI 생성 요약
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  실행 가능한 추천
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  트렌드 감지
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Tag-based Pattern Discovery */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-700">
                <Tags className="h-4 w-4" />
                태그 기반 분석
              </div>
              <h2 className="text-3xl font-bold tracking-tight">태그 기반 패턴 발견</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                맞춤 태깅 시스템이 길이, 톤, 주제별로 콘텐츠를 분석합니다. 카테고리별 성과를 비교해 무엇이
                효과적인지 파악하세요.
              </p>
              <ul className="mt-6 space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  길이 분석(짧음/중간/길음)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  톤 분류
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  주제 분류
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex flex-wrap gap-2">
                <Badge variant="secondary">#productivity</Badge>
                <Badge variant="secondary">#casual</Badge>
                <Badge variant="secondary">#short</Badge>
                <Badge variant="outline">#tips</Badge>
                <Badge variant="outline">#personal</Badge>
              </div>
              <div className="flex items-center justify-center py-4">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <BarItem label="#productivity" value={85} />
                <BarItem label="#casual" value={72} />
                <BarItem label="#short" value={68} />
                <BarItem label="#tips" value={54} />
                <BarItem label="#personal" value={45} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Fully Automated Pipeline */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col items-center gap-4">
                  <PipelineStep step="1" label="데이터 수집" description="크론 잡으로 지표 수집" />
                  <div className="h-8 w-px bg-border" />
                  <PipelineStep step="2" label="처리" description="데이터 정제 및 통합" />
                  <div className="h-8 w-px bg-border" />
                  <PipelineStep step="3" label="AI 분석" description="인사이트 생성" />
                  <div className="h-8 w-px bg-border" />
                  <PipelineStep step="4" label="전달" description="대시보드 및 리포트" />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-700">
                <Workflow className="h-4 w-4" />
                자동화 파이프라인
              </div>
              <h2 className="text-3xl font-bold tracking-tight">완전 자동화 파이프라인</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                데이터 수집부터 인사이트 생성까지 전 과정을 자동화합니다. 스케줄된 크론 잡, 데이터 파이프라인, AI
                처리가 매끄럽게 이어집니다.
              </p>
              <ul className="mt-6 space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  예약된 데이터 수집
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  자동 처리 파이프라인
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  수동 개입 없음
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 CIAS. 무단 복제 및 배포를 금합니다.</p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/stu442"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/민수-박-3b981029a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a
              href="https://www.threads.com/@dev_frogsoo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Threads
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: React.ElementType
  label: string
  value: string
  trend: string
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-xs text-emerald-600">{trend}</span>
      </div>
    </div>
  )
}

function BarItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function PipelineStep({
  step,
  label,
  description,
}: {
  step: string
  label: string
  description: string
}) {
  return (
    <div className="flex w-full items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-700">
        {step}
      </div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
