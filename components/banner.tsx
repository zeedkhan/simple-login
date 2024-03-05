"use client";

import cookie from "js-cookie";
import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from 'next/navigation';

interface TypeCookies {
    interacted: boolean,
    ad_personalization: boolean
    ad_storage: boolean
    ad_user_data: boolean
    analytics_storage: boolean
    functionality_storage: boolean
    personalization_storage: boolean
    security_storage: boolean
};

const initConsent: TypeCookies = {
    interacted: false,
    ad_personalization: false,
    ad_storage: false,
    ad_user_data: false,
    analytics_storage: false,
    functionality_storage: false,
    personalization_storage: false,
    security_storage: false
};

export default function Banner() {
    const [showBanner, setShowBanner] = useState(true);
    const router = useRouter();

    const [consentParams, setConsentParams] = useState<TypeCookies>(initConsent);
    const [showCustom, setShowCustom] = useState(false);

    const [loadConsent, setLoadConsent] = useState<boolean>(true);

    useEffect(() => {
        const consentCookie = cookie.get("consentMode");
        if (consentCookie === undefined) {
            cookie.set("consentMode", JSON.stringify(initConsent));
            setShowBanner(true);
            setLoadConsent(false)
            return;
        };

        const consentCookie2 = cookie.get("consentMode");
        if (consentCookie2) {
            const paseC: TypeCookies = JSON.parse(consentCookie);
            if (!paseC.interacted) {
                setShowBanner(true)
            } else {
                setShowBanner(false)
            }
        }

        setLoadConsent(false)


    }, []);

    const handleAcceptAll = () => {
        const consentCookie = cookie.get("consentMode");
        if (consentCookie) {
            const paseC: TypeCookies = JSON.parse(consentCookie);

            const c: TypeCookies = Object.assign({}, ...Object.entries(paseC).map((i) => {
                return {
                    [i[0]]: true
                }
            }));

            setShowBanner(false);
            cookie.set("consentMode", JSON.stringify(c), { expires: 365 });
        };
        router.refresh();
    };

    const handleRejectAll = () => {
        const consentCookie = cookie.get("consentMode");
        if (consentCookie) {
            const paseC: TypeCookies = JSON.parse(consentCookie);
            const c: TypeCookies = Object.assign({}, ...Object.entries(paseC).map((i) => {
                return {
                    [i[0]]: false
                }
            }));

            c.interacted = true;

            setShowBanner(false);
            cookie.set("consentMode", JSON.stringify(c), { expires: 365 });
        };
        router.refresh();
    };

    const handleCustom = () => {
        const params = {
            ...consentParams,
            interacted: true,
        };
        
        setConsentParams((prev) => {
            return {
                ...prev,
                interacted: true,
            }
        });

        cookie.set("consentMode", JSON.stringify(params));
        setShowBanner(false);
    }

    if (loadConsent) {
        return null;
    }

    if (!showBanner) {
        const cookies = cookie.get("consentMode");
        const val = cookies ? cookies : JSON.stringify(initConsent)
        return (
            <Script id='banner-script'>
                {`
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                event: "consent",
                consent: ${val}
              });
            `}
            </Script>
        );
    };




    return (
        <div className="h-full w-full">
            <div className="absolute bottom-20 left-0 max-fit px-4 py-2 shadow-md transition-all duration-500 ease-in-out"
                style={{ backgroundColor: "rgb(255, 255, 255)", color: "rgb(0,0,0)", fontFamily: "Inter, sans-serif", borderRadius: "1rem" }}>
                <div className="flex flex-col px-0 ltr:lg:pl-10 rtl:lg:pr-10">
                    <div className="w-full flex justify-between items-center">
                        <p className="text-md md:text-lg font-semibold m-0" style={{ color: "rgb(89, 79, 253)" }}>Your Cookie Preferences</p>
                    </div>
                    <div className="flex flex-col gap-2 items-stretch ltr:lg:pr-10 rtl:lg:pl-10">
                        <div className="flex-1">
                            <p className="my-1 text-xs md:text-sm" style={{ color: "rgb(0, 0, 0)" }}>
                                By clicking “Accept all,” you agree to the storing of cookies on your device for functional, analytics, and advertising purposes.
                            </p>
                            <div className="flex text-center text-[9px] mt-2 gap-2">
                                <span className="ltr:mr-4 ltr:last:mr-0 rtl:ml-4 rtl:last:ml-0">

                                    <a href="" target="_blank" className="no-underline cursor-pointer shrink-0" style={{ color: "rgb(89, 79, 253)", borderBottom: "1px solid rgb(89, 79, 253)" }}>Privacy policy</a>
                                </span>
                                <span className="ltr:mr-4 ltr:last:mr-0 rtl:ml-4 rtl:last:ml-0">
                                    <a className="no-underline cursor-pointer shrink-0" style={{ color: "rgb(89, 79, 253)", borderBottom: "1px solid rgb(89, 79, 253)" }}>Cookie policy</a>
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-around mt-4 lg:mt-0 ltr:lg:pl-14 rtl:lg:pr-14">
                            {showBanner && (
                                <Script id="init-consent">
                                    {`
                                    window.dataLayer = window.dataLayer || [];
                                    window.dataLayer.push({
                                        event: "init_consent",
                                        consent: ${JSON.stringify(consentParams)}
                                    });
                                `}
                                </Script>
                            )}
                            {!showCustom && !loadConsent ? (
                                <div className="flex-1 gap-2  items-center flex my-0">
                                    <button
                                        onClick={() => setShowCustom(true)}
                                        className="flex-1 lg:flex-none ltr:mr-2 rtl:ml-2 flex justify-center items-center text-center cursor-pointer px-2 md:px-4 py-2 border border-transparent text-xs leading-4 font-black"
                                        style={{ backgroundColor: "rgba(89, 79, 253, 0.2)", color: "rgb(89, 79, 253)", borderRadius: "0.375rem" }}>
                                        <span>Custom permissions</span>
                                    </button>
                                    <button
                                        onClick={() => handleRejectAll()}
                                        className="flex-1 lg:flex-none flex justify-center items-center text-center cursor-pointer px-2 md:px-4 py-2 border border-transparent text-xs leading-4 font-black"
                                        style={{ backgroundColor: "rgb(89,79,253)", color: "rgb(255,255,255)", borderRadius: "0.375rem" }}>
                                        <span>Reject all</span>
                                    </button>
                                    <button
                                        onClick={() => handleAcceptAll()}
                                        className="flex-1 lg:flex-none flex justify-center items-center text-center cursor-pointer px-2 md:px-4 py-2 border border-transparent text-xs leading-4 font-black"
                                        style={{ backgroundColor: "rgb(89,79,253)", color: "rgb(255,255,255)", borderRadius: "0.375rem" }}>
                                        <span>Accept all</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 gap-2  items-center flex my-0">
                                    <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                                        <input
                                            id="ad_personalization"
                                            type="radio"
                                            checked={consentParams.ad_personalization}
                                            onChange={(e) => {
                                                setConsentParams((prev) => {
                                                    return {
                                                        ...prev,
                                                        ad_personalization: e.target.checked
                                                    }
                                                })
                                            }}
                                            name="ad_personalization"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="ad_personalization" className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">ad_personalization</label>
                                    </div>

                                    <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                                        <input
                                            id="ad_storage"
                                            type="radio"
                                            checked={consentParams.ad_storage}
                                            onChange={(e) => {
                                                setConsentParams((prev) => {
                                                    return {
                                                        ...prev,
                                                        ad_storage: e.target.checked
                                                    }
                                                })
                                            }}
                                            name="ad_storage"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="ad_storage" className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">ad_storage</label>
                                    </div>

                                    <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                                        <input
                                            id="ad_user_data"
                                            type="radio"
                                            checked={consentParams.ad_user_data}
                                            onChange={(e) => {
                                                setConsentParams((prev) => {
                                                    return {
                                                        ...prev,
                                                        ad_user_data: e.target.checked
                                                    }
                                                })
                                            }}
                                            name="ad_user_data"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="ad_user_data" className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">ad_user_data</label>
                                    </div>


                                    <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                                        <input
                                            id="analytics_storage"
                                            type="radio"
                                            onChange={(e) => {
                                                setConsentParams((prev) => {
                                                    return {
                                                        ...prev,
                                                        analytics_storage: e.target.checked
                                                    }
                                                })
                                            }}
                                            checked={consentParams.analytics_storage}
                                            name="analytics_storage"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="analytics_storage" className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">analytics_storage</label>
                                    </div>


                                    <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                                        <input id="functionality_storage"
                                            type="radio"
                                            checked={consentParams.functionality_storage}
                                            onChange={(e) => {
                                                setConsentParams((prev) => {
                                                    return {
                                                        ...prev,
                                                        functionality_storage: e.target.checked
                                                    }
                                                })
                                            }}
                                            name="functionality_storage"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="functionality_storage" className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">functionality_storage</label>
                                    </div>

                                    <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                                        <input
                                            onChange={(e) => {
                                                setConsentParams((prev) => {
                                                    return {
                                                        ...prev,
                                                        personalization_storage: e.target.checked
                                                    }
                                                })
                                            }}
                                            id="personalization_storage"
                                            type="radio"
                                            checked={consentParams.personalization_storage}
                                            name="personalization_storage"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="personalization_storage" className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">personalization_storage</label>
                                    </div>


                                    <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                                        <input
                                            id="security_storage"
                                            type="radio"
                                            onChange={(e) => {
                                                setConsentParams((prev) => {
                                                    return {
                                                        ...prev,
                                                        security_storage: e.target.checked
                                                    }
                                                })
                                            }}
                                            checked={consentParams.security_storage}
                                            name="security_storage"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="security_storage" className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">security_storage</label>
                                    </div>


                                    <div>
                                        <button
                                            onClick={() => handleCustom()}
                                        >Submit custom</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}