import { useEffect, useState } from "react"

const DESKTOP_MIN_WIDTH = 1024

type DeviceType = "mobile" | "tablet" | "desktop"

export interface LayoutEnvironment {
	isDesktop: boolean
	deviceType: DeviceType
	browser: {
		name: string
		version: string | null
		userAgent: string
	}
	zoom: {
		devicePixelRatio: number
		// Approximate zoom level where 1 = 100%
		zoomFactor: number
	}
}

function detectDeviceType(width: number): DeviceType {
	if (width < 768) return "mobile"
	if (width < 1024) return "tablet"
	return "desktop"
}

function getBrowserInfo(): LayoutEnvironment["browser"] {
	if (typeof navigator === "undefined") {
		return { name: "unknown", version: null, userAgent: "" }
	}

	const ua = navigator.userAgent
	let name = "unknown"
	let version: string | null = null

	if (/Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua)) {
		name = "chrome"
		version = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? null
	} else if (/Safari\//.test(ua) && /Version\//.test(ua)) {
		name = "safari"
		version = ua.match(/Version\/([\d.]+)/)?.[1] ?? null
	} else if (/Firefox\//.test(ua)) {
		name = "firefox"
		version = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? null
	} else if (/Edg\//.test(ua)) {
		name = "edge"
		version = ua.match(/Edg\/([\d.]+)/)?.[1] ?? null
	}

	return { name, version, userAgent: ua }
}

export function useLayoutEnvironment(): LayoutEnvironment {
	const [env, setEnv] = useState<LayoutEnvironment>(() => {
		if (typeof window === "undefined") {
			return {
				isDesktop: true,
				deviceType: "desktop",
				browser: { name: "unknown", version: null, userAgent: "" },
				zoom: {
					devicePixelRatio: 1,
					zoomFactor: 1,
				},
			}
		}

		const width = window.innerWidth
		const dpr = window.devicePixelRatio || 1

		return {
			isDesktop: width >= DESKTOP_MIN_WIDTH,
			deviceType: detectDeviceType(width),
			browser: getBrowserInfo(),
			zoom: {
				devicePixelRatio: dpr,
				zoomFactor: dpr,
			},
		}
	})

	useEffect(() => {
		if (typeof window === "undefined") return

		const handleChange = () => {
			const width = window.innerWidth
			const dpr = window.devicePixelRatio || 1

			setEnv(prev => ({
				...prev,
				isDesktop: width >= DESKTOP_MIN_WIDTH,
				deviceType: detectDeviceType(width),
				zoom: {
					devicePixelRatio: dpr,
					zoomFactor: dpr,
				},
			}))
		}

		handleChange()
		window.addEventListener("resize", handleChange)
		window.matchMedia("(resolution: 2dppx)").addEventListener("change", handleChange)

		return () => {
			window.removeEventListener("resize", handleChange)
			window.matchMedia("(resolution: 2dppx)").removeEventListener("change", handleChange)
		}
	}, [])

	return env
}

export function useResponsivePadding() {
	const env = useLayoutEnvironment()
	const { isDesktop, deviceType } = env

	// Desktop keeps existing spacing; tablet/mobile get slightly tighter padding.
	const containerPaddingX = isDesktop ? "px-4" : deviceType === "tablet" ? "px-4" : "px-3"
	const containerPaddingY = isDesktop ? "py-6" : "py-4"
	const sectionTopPadding = isDesktop ? "py-12 md:py-16" : deviceType === "tablet" ? "py-10" : "pt-8 pb-10"

	return {
		...env,
		containerPadding: `${containerPaddingX} ${containerPaddingY}`,
		sectionTopPadding,
	}
}

