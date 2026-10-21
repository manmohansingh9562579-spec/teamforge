"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Code2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { Label, Input, FormError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signInSchema, type SignInInput } from "@/validations/auth";

const easeOut = [0.22, 1, 0.36, 1] as const;

function SignInBrand({ size = 38 }: { size?: number }) {
  return (
    <Link href="/" className="inline-flex w-fit items-center gap-2.5" aria-label="TeamForge home">
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        priority
        className="rounded-[9px]"
      />
      <span className="text-[17px] font-semibold tracking-tight text-white">
        Team<span className="text-[#9b8cff]">Forge</span>
      </span>
    </Link>
  );
}

function BuilderConstellation({ reducedMotion }: { reducedMotion: boolean }) {
  const nodes = [
    { x: 218, y: 34, r: 30, tone: "#69d9d0", mark: "D" },
    { x: 377, y: 126, r: 30, tone: "#9b8cff", mark: "{}" },
    { x: 401, y: 246, r: 26, tone: "#779dff", mark: "A" },
    { x: 306, y: 384, r: 30, tone: "#69d9d0", mark: "↗" },
    { x: 166, y: 397, r: 26, tone: "#9b8cff", mark: "L" },
    { x: 44, y: 304, r: 30, tone: "#779dff", mark: "<>" },
    { x: 69, y: 111, r: 26, tone: "#69d9d0", mark: "T" },
  ];
  const links = nodes.map((node, index) => [node, nodes[(index + 1) % nodes.length]] as const);

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 436 436"
      className="pointer-events-none absolute bottom-3 left-[30.5%] hidden h-[436px] w-[436px] overflow-visible xl:block"
    >
      <defs>
        <radialGradient id="forge-core-glow">
          <stop offset="0%" stopColor="#766bff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#766bff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.circle
        cx="218"
        cy="218"
        r="218"
        fill="none"
        stroke="#34394a"
        strokeWidth="1"
        strokeDasharray="2 10"
        initial={false}
        animate={reducedMotion ? { opacity: 0.55 } : { opacity: [0.38, 0.68, 0.38], rotate: [0, 4, 0] }}
        transition={{ duration: 8, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "218px 218px" }}
      />
      <circle cx="218" cy="218" r="143" fill="none" stroke="#34394a" strokeWidth="1" opacity="0.8" />
      <circle cx="218" cy="218" r="82" fill="url(#forge-core-glow)" />

      {links.map(([from, to], index) => (
        <motion.line
          key={`outer-link-${index}`}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="#51576a"
          strokeWidth="1"
          initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.65 }}
          transition={{ duration: 1.15, delay: 0.35 + index * 0.09, ease: easeOut }}
        />
      ))}
      {nodes.map((node, index) => (
        <motion.line
          key={`core-link-${index}`}
          x1={node.x}
          y1={node.y}
          x2="218"
          y2="218"
          stroke="#51576a"
          strokeWidth="1"
          opacity="0.5"
          initial={reducedMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.55 + index * 0.08, ease: easeOut }}
        />
      ))}

      {nodes.map((node, index) => (
        <motion.g
          key={node.mark}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.72, y: 8 }}
          animate={
            reducedMotion
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 1, scale: [1, 1.045, 1], y: [0, -3, 0] }
          }
          transition={{
            opacity: { duration: 0.45, delay: 0.68 + index * 0.1 },
            scale: { duration: 3.8 + index * 0.22, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut", delay: index * 0.18 },
            y: { duration: 3.8 + index * 0.22, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut", delay: index * 0.18 },
          }}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
        >
          <circle cx={node.x} cy={node.y} r={node.r} fill="#141821" stroke="#34394a" strokeWidth="1" />
          <circle cx={node.x} cy={node.y} r={node.r - 4} fill={node.tone} opacity="0.14" />
          <text
            x={node.x}
            y={node.y + 5}
            textAnchor="middle"
            fill="#f4f6fb"
            fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace"
            fontSize={node.r < 28 ? 12 : 13}
            fontWeight="600"
          >
            {node.mark}
          </text>
        </motion.g>
      ))}

      <motion.circle
        cx="218"
        cy="218"
        r="62"
        fill="none"
        stroke="#9b8cff"
        strokeWidth="1"
        initial={false}
        animate={reducedMotion ? { opacity: 0.7 } : { opacity: [0.3, 0.8, 0.3], scale: [0.98, 1.035, 0.98] }}
        transition={{ duration: 4.8, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "218px 218px" }}
      />
      <motion.circle
        cx="218"
        cy="218"
        r="48"
        fill="#766bff"
        initial={reducedMotion ? false : { scale: 0.7, opacity: 0 }}
        animate={reducedMotion ? { scale: 1, opacity: 1 } : { scale: [1, 1.025, 1], opacity: 1 }}
        transition={{ duration: 3.5, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut", delay: 0.45 }}
        style={{ transformOrigin: "218px 218px" }}
      />
      <text x="218" y="226" textAnchor="middle" fill="white" fontSize="21" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
        TF
      </text>
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (values: SignInInput) => {
    setServerError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Incorrect email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0d12] text-[#f4f6fb] selection:bg-[#766bff]/30">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-56 top-[34%] h-[470px] w-[680px] rounded-full bg-[#766bff]/10 blur-[110px]" />
        <div className="absolute right-[5%] top-[8%] h-[320px] w-[360px] rounded-full bg-[#766bff]/[0.06] blur-[105px]" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1600px] xl:grid-cols-[minmax(0,7fr)_minmax(420px,5fr)]">
        <section className="relative hidden min-h-[960px] overflow-hidden border-r border-[#272d38]/80 bg-[#10131a] px-12 py-14 xl:block xl:px-[clamp(48px,5.28vw,76px)]">
          <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-[38%] h-[560px] w-[560px] rounded-full bg-[#766bff]/[0.09] blur-[105px]" />
          <div aria-hidden="true" className="pointer-events-none absolute left-[56%] top-[64%] h-[280px] w-[280px] rounded-full bg-[#69d9d0]/[0.05] blur-[95px]" />
          <BuilderConstellation reducedMotion={reduceMotion} />

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easeOut }}
            className="relative z-10"
          >
            <SignInBrand />
          </motion.div>

          <div className="relative z-10 mt-[70px] max-w-[560px]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: easeOut }}
              className="inline-flex h-8 items-center gap-2.5 rounded-full border border-[#272d38] bg-[#141821] px-3 text-[10px] font-semibold tracking-[0.09em] text-[#a0a8b7]"
            >
              <span className="relative flex h-2 w-2">
                {!reduceMotion && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#69d9d0]/60" />}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#69d9d0]" />
              </span>
              BUILT FOR PEOPLE WHO BUILD
            </motion.div>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.78, delay: 0.2, ease: easeOut }}
              className="mt-[30px] text-[43px] font-bold leading-[1.12] tracking-[-0.045em] text-[#f4f6fb] 2xl:text-[48px]"
            >
              Make your next
              <br />
              <span className="bg-gradient-to-r from-[#b0a5ff] via-[#9b8cff] to-[#766bff] bg-clip-text text-transparent">big build</span>
              <br />
              happen here.
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.34, ease: easeOut }}
              className="mt-5 max-w-[435px] text-[16px] leading-[1.6] text-[#a0a8b7]"
            >
              Find thoughtful teammates, sharpen your logic, and turn a good idea into something real.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.48, ease: easeOut }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <span className="inline-flex h-[34px] items-center gap-2.5 rounded-full border border-[#272d38] bg-[#141821] px-3 text-[10px] font-semibold tracking-[0.08em] text-[#a0a8b7]">
                <span className="h-2 w-2 rounded-full bg-[#69d9d0]" /> LOGIC &amp; DATA
              </span>
              <span className="inline-flex h-[34px] items-center gap-2.5 rounded-full border border-[#272d38] bg-[#141821] px-3 text-[10px] font-semibold tracking-[0.08em] text-[#a0a8b7]">
                <span className="h-2 w-2 rounded-full bg-[#9b8cff]" /> BUILD TOGETHER
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: [0, -7, 0], scale: 1 }}
            transition={{ opacity: { duration: 0.6, delay: 0.72 }, y: { duration: 5.2, repeat: reduceMotion ? 0 : Infinity, ease: "easeInOut", delay: 0.7 } }}
            className="absolute bottom-12 left-[58%] z-10 flex w-[282px] items-center gap-4 rounded-2xl border border-[#272d38] bg-[#141821]/95 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl"
          >
            <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border border-[#766bff]/40 bg-[#766bff]/15 text-[#b0a5ff]">
              <Code2 size={17} strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold tracking-[0.09em] text-[#a0a8b7]">LOGIC &amp; DATA</span>
              <span className="mt-1 block text-[14px] font-medium text-[#f4f6fb]">Think past the prompt.</span>
            </span>
            <span aria-hidden="true" className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#69d9d0] shadow-[0_0_12px_#69d9d0]" />
          </motion.div>

          <p className="absolute bottom-10 left-[clamp(48px,5.28vw,76px)] z-10 text-[12px] tracking-[0.02em] text-[#707a8b]">
            A network for your next chapter.
          </p>
        </section>

        <section className="relative flex min-h-screen w-full items-start justify-center px-4 py-6 sm:px-8 xl:items-center xl:px-10 xl:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute right-[2%] top-[5%] hidden h-[330px] w-[330px] rounded-full bg-[#766bff]/[0.06] blur-[100px] xl:block" />

          <div className="relative z-10 w-full max-w-[440px] xl:my-auto">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="xl:hidden"
            >
              <SignInBrand size={32} />
              <p className="mt-[42px] text-[10px] font-semibold tracking-[0.1em] text-[#69d9d0]">BUILT FOR PEOPLE WHO BUILD</p>
              <h1 className="mt-3 text-[34px] font-bold leading-[1.12] tracking-[-0.045em] text-[#f4f6fb]">
                Make your next
                <br />
                <span className="bg-gradient-to-r from-[#b0a5ff] to-[#766bff] bg-clip-text text-transparent">big build happen.</span>
              </h1>
              <p className="mt-2.5 max-w-[340px] text-[14px] leading-[1.5] text-[#a0a8b7]">
                Your people, ideas, and progress—ready when you are.
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.78, delay: reduceMotion ? 0 : 0.12, ease: easeOut }}
              className="mt-6 rounded-[22px] border border-[#272d38] bg-[#141821] px-[22px] py-6 shadow-[0_30px_90px_rgba(0,0,0,0.36)] sm:px-8 sm:py-8 xl:mt-0 xl:rounded-[24px]"
            >
              <div className="hidden xl:block">
                <SignInBrand size={34} />
              </div>

              <div className="mt-0 xl:mt-[31px]">
                <p className="hidden text-[10px] font-semibold tracking-[0.13em] text-[#9b8cff] xl:block">WELCOME BACK</p>
                <h2 className="mt-0 text-[24px] font-bold tracking-[-0.035em] text-[#f4f6fb] xl:mt-2.5 xl:text-[29px]">
                  <span className="xl:hidden">Welcome back</span>
                  <span className="hidden xl:inline">Sign in to TeamForge</span>
                </h2>
                <p className="mt-1.5 text-[13px] text-[#a0a8b7] xl:mt-1 xl:text-[15px]">
                  <span className="xl:hidden">Sign in to continue building.</span>
                  <span className="hidden xl:inline">Pick up where your next build begins.</span>
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 xl:mt-[31px]">
                <div>
                  <Label htmlFor="email" className="mb-1.5 text-[12px] text-[#a0a8b7]">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="h-[50px] rounded-xl border-[#272d38] bg-[#10131a] px-3.5 text-[14px] text-[#f4f6fb] placeholder:text-[#707a8b] focus:border-[#9b8cff] focus:ring-[#766bff]/20 xl:h-[54px]"
                    {...register("email")}
                  />
                  <div id="email-error"><FormError>{errors.email?.message}</FormError></div>
                </div>

                <div className="mt-4 xl:mt-1">
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label htmlFor="password" className="mb-0 text-[12px] text-[#a0a8b7]">Password</Label>
                    <Link href="/forgot-password" className="rounded-sm text-[12px] font-medium text-[#9b8cff] transition-colors hover:text-[#c3baff] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      className="h-[50px] rounded-xl border-[#272d38] bg-[#10131a] px-3.5 pr-12 text-[14px] text-[#f4f6fb] placeholder:text-[#707a8b] focus:border-[#9b8cff] focus:ring-[#766bff]/20 xl:h-[54px]"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-[#707a8b] transition-colors hover:text-[#c3baff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9b8cff]"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <div id="password-error"><FormError>{errors.password?.message}</FormError></div>
                </div>

                <div className="mt-5 flex min-h-[18px] items-center gap-2 text-[12px] text-[#a0a8b7] xl:mt-5">
                  <ShieldCheck size={16} className="shrink-0 text-[#69d9d0]" />
                  <span>Secure session</span>
                </div>

                <AnimatePresence initial={false}>
                  {serverError && (
                    <motion.div
                      role="alert"
                      initial={reduceMotion ? false : { opacity: 0, height: 0, y: -4 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 overflow-hidden rounded-xl border border-[#f06476]/20 bg-[#f06476]/[0.08] px-3.5 py-2.5 text-[13px] text-[#ff8795]"
                    >
                      {serverError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  size="lg"
                  loading={isSubmitting}
                  className="group mt-5 h-[52px] w-full rounded-[13px] bg-[#766bff] text-[14px] text-white shadow-[0_12px_34px_rgba(118,107,255,0.18)] transition-all hover:bg-[#8177ff] hover:shadow-[0_15px_42px_rgba(118,107,255,0.3)] xl:h-[54px]"
                >
                  <span>Sign in</span>
                  <ArrowUpRight size={18} className="ml-auto transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Button>
              </form>

              <p className="mt-3.5 flex items-center gap-1.5 text-[11px] text-[#707a8b]">
                <Check size={13} className="text-[#69d9d0]" /> Secure sign-in · Your account stays yours.
              </p>
              <div className="my-[21px] h-px bg-[#272d38]" />
              <p className="flex flex-wrap items-center gap-x-1.5 text-[13px] text-[#a0a8b7]">
                <span>Don&apos;t have an account?</span>
                <Link href="/signup" className="rounded-sm font-semibold text-[#9b8cff] transition-colors hover:text-[#c3baff] hover:underline">
                  Create one
                </Link>
              </p>
              <p className="mt-6 hidden text-[11px] text-[#707a8b] xl:block">
                By continuing, you agree to build with respect.
              </p>
            </motion.div>

            <p className="mt-7 hidden text-center text-[12px] tracking-[0.01em] text-[#707a8b] xl:block">
              © TeamForge <span className="px-1.5 text-[#414859]">·</span> Build good things together.
            </p>
            <p className="mt-7 pb-2 text-center text-[10px] font-medium tracking-[0.12em] text-[#707a8b] xl:hidden">
              TEAMFORGE <span className="px-1 text-[#414859]">/</span> BUILDER NETWORK
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
