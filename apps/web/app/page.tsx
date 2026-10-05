"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight,  CheckCircle2, Sparkles } from "lucide-react";

import { Header } from "@/components/Header";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};



const learningPaths = [
  {
    title: "Web Development",
    description: "Build modern websites and applications.",
    icon: "01",
  },
  {
    title: "Data & Analytics",
    description: "Turn data into useful decisions.",
    icon: "02",
  },
  {
    title: "Design",
    description: "Create better digital experiences.",
    icon: "03",
  },
  {
    title: "Business",
    description: "Develop skills that move businesses forward.",
    icon: "04",
  },
];

export default function Home() {
  return (
    <>
      <Header />

      <main className="overflow-hidden bg-white">
        {/* HERO */}
        <section className="relative min-h-[calc(100vh-64px)] bg-[#f7f9fa]">
          {/* Animated background shapes */}
          <motion.div
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#5624d0]/10 blur-3xl"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#a435f0]/10 blur-3xl"
            animate={{
              scale: [1.15, 1, 1.15],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1fr_0.9fr] lg:px-8">
            {/* HERO CONTENT */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-2xl"
            >
              <motion.div
                variants={fadeUpVariants}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d1d7dc] bg-white px-4 py-2 text-sm font-bold shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-[#5624d0]" />
                Learn. Build. Grow.
              </motion.div>

              <motion.h1
                variants={fadeUpVariants}
                className="text-5xl font-black leading-[0.98] tracking-[-2.5px] text-[#1c1d1f] sm:text-6xl lg:text-7xl"
              >
                Skills that
                <br />
                <span className="relative inline-block text-[#5624d0]">
                  move you forward.
                  <motion.span
                    className="absolute -bottom-2 left-0 h-1 w-full origin-left bg-[#5624d0]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      delay: 1,
                      duration: 0.8,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUpVariants}
                className="mt-7 max-w-xl text-lg leading-8 text-[#4b4f52] sm:text-xl"
              >
                Learn practical skills through structured courses,
                real-world lessons, and hands-on learning designed to help
                you build confidence and create your next opportunity.
              </motion.p>

              <motion.div
                variants={fadeUpVariants}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/dashboard"
                  className="group inline-flex h-14 items-center justify-center gap-3 bg-[#5624d0] px-7 font-bold text-white shadow-lg shadow-[#5624d0]/20 transition hover:bg-[#401b9b] hover:shadow-xl"
                >
                  Explore Courses
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/auth/sign-up"
                  className="inline-flex h-14 items-center justify-center border border-[#1c1d1f] bg-white px-7 font-bold text-[#1c1d1f] transition hover:bg-[#f1f1f1]"
                >
                  Start Learning
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUpVariants}
                className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#6a6f73]"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#5624d0]" />
                  Learn at your pace
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#5624d0]" />
                  Practical lessons
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#5624d0]" />
                  Track your progress
                </span>
              </motion.div>
            </motion.div>

            {/* HERO VISUAL */}
            <div className="relative min-h-[500px]">
              {/* Main image */}
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  x: 50,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.9,
                  delay: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute right-0 top-8 h-[430px] w-[88%] overflow-hidden rounded-2xl bg-[#1c1d1f] shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85"
                  alt="Students learning together"
                  className="h-full w-full object-cover opacity-90"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute bottom-7 left-7 right-7 text-white">
                  <p className="text-sm font-bold uppercase tracking-widest text-white/70">
                    Learning together
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Build skills that matter.
                  </h2>
                </div>
              </motion.div>

            

              {/* Floating statistic */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 1,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
                className="absolute -bottom-3 right-2 z-10 w-56 rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-xl"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#6a6f73]">
                  Keep growing
                </p>

                <p className="mt-2 text-3xl font-black text-[#5624d0]">
                  10k+
                </p>

                <p className="mt-1 text-sm text-[#6a6f73]">
                  learning opportunities
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-y border-[#d1d7dc] bg-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={containerVariants}
            className="mx-auto grid max-w-7xl divide-y border-x border-[#d1d7dc] sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          >
            {[
              ["10K+", "Learners"],
              ["500+", "Courses"],
              ["50+", "Instructors"],
            ].map(([number, label]) => (
              <motion.div
                key={label}
                variants={fadeUpVariants}
                className="px-6 py-10 text-center"
              >
                <p className="text-4xl font-black text-[#1c1d1f]">
                  {number}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#6a6f73]">
                  {label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* LEARNING PATHS */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
            >
              <motion.p
                variants={fadeUpVariants}
                className="text-sm font-bold uppercase tracking-[0.16em] text-[#5624d0]"
              >
                Explore possibilities
              </motion.p>

              <motion.h2
                variants={fadeUpVariants}
                className="mt-3 max-w-2xl text-4xl font-black tracking-[-1.5px] sm:text-5xl"
              >
                Learn skills for where you want to go.
              </motion.h2>

              <motion.p
                variants={fadeUpVariants}
                className="mt-5 max-w-2xl text-lg leading-7 text-[#6a6f73]"
              >
                Discover structured learning paths built around practical
                skills and real-world goals.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={containerVariants}
              className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {learningPaths.map((path) => (
                <motion.div
                  key={path.title}
                  variants={fadeUpVariants}
                  whileHover={{
                    y: -8,
                    transition: {
                      duration: 0.25,
                    },
                  }}
                  className="group border border-[#d1d7dc] bg-white p-7 transition-shadow duration-300 hover:shadow-xl"
                >
                  <div className="flex h-11 w-11 items-center justify-center bg-[#5624d0] text-sm font-black text-white">
                    {path.icon}
                  </div>

                  <h3 className="mt-7 text-xl font-black">
                    {path.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#6a6f73]">
                    {path.description}
                  </p>

                  <Link
                    href="/dashboard"
                    className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#5624d0]"
                  >
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        

        {/* INSTRUCTOR CTA */}
        <section className="bg-[#1c1d1f] py-24 text-white">
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto max-w-7xl px-6 text-center lg:px-8"
          >
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#c7b5ff]">
              For instructors
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-[-1.5px] sm:text-5xl">
              Turn what you know into something others can learn.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
              Create structured courses, publish lessons, and build a
              learning experience around your expertise.
            </p>

            <Link
              href="/auth/sign-up"
              className="group mt-9 inline-flex items-center gap-3 bg-white px-7 py-4 font-bold text-[#1c1d1f] transition hover:bg-gray-100"
            >
              Start teaching
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-white py-24">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto max-w-5xl px-6 text-center"
          >
            <h2 className="text-4xl font-black tracking-[-1.5px] sm:text-5xl">
              Your next skill starts here.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-[#6a6f73]">
              Explore courses, start learning, and build momentum toward
              your next goal.
            </p>

            <Link
              href="/dashboard"
              className="group mt-8 inline-flex items-center gap-3 bg-[#5624d0] px-8 py-4 font-bold text-white shadow-lg shadow-[#5624d0]/20 transition hover:bg-[#401b9b] hover:shadow-xl"
            >
              Explore Courses
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1c1d1f] py-10 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-5 px-6 md:flex-row lg:px-8">
          <div>
            <div className="text-2xl font-black">
              Learning Platform
            </div>

            <p className="mt-2 text-sm text-gray-400">
              Learn skills that move you forward.
            </p>
          </div>

          <p className="text-sm text-gray-400">
            Learn. Build. Grow.
          </p>
        </div>
      </footer>
    </>
  );
}