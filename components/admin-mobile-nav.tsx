"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Droplet, BarChart3, Users, AlertCircle, LogOut, Smartphone, Menu, X } from "lucide-react"

export function AdminMobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem("adminSession")
        router.push("/admin/login")
    }

    const links = [
        { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/admin/donors", label: "Manage Donors", icon: Users },
        { href: "/admin/emergencies", label: "Emergency Requests", icon: AlertCircle },
        { href: "/admin/whatsapp", label: "WhatsApp Setup", icon: Smartphone },
        { href: "/admin/sms", label: "SMS Setup", icon: Smartphone },
    ]
    // Note: I added Camps and Admins links because I saw the directories. I should verifying if AdminSidebar has them.
    // The AdminSidebar file I read earlier DID NOT have camps/admins links in the hardcoded list!
    // It only had: Dashboard, Donors, Emergencies, WhatsApp, SMS.
    // But the folders exist. Maybe I should check if the user wants them?
    // I will check the AdminSidebar again to be PRECISE.

    return (
        <>
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setIsOpen(true)}>
                <Menu className="h-6 w-6" />
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="relative w-64 bg-background border-r border-border h-full flex flex-col p-4 animate-in slide-in-from-left duration-300">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <Image
                                    src="/nss-logo.png"
                                    alt="NSS Logo"
                                    width={24}
                                    height={24}
                                    className="h-6 w-6 object-contain"
                                />
                                <span>NSS Admin</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <nav className="flex-1 space-y-2 overflow-y-auto">
                            {links.map((link) => {
                                const Icon = link.icon
                                const isActive = pathname === link.href
                                return (
                                    <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                                        <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start">
                                            <Icon className="mr-2 h-4 w-4" />
                                            {link.label}
                                        </Button>
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className="pt-4 mt-auto border-t border-border">
                            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
