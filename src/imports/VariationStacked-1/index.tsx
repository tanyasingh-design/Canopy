import svgPaths from "./svg-g6tup9m5q8";
import imgFrame from "./57caa5b36da863af993df95e09ebf30648012bad.png";

function SignalHigh() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="signal-high">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="signal-high">
          <path d={svgPaths.p15c2b00} id="Vector" stroke="var(--stroke-0, #3C3633)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function WifiHigh() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="wifi-high">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="wifi-high">
          <path d={svgPaths.p104a8200} id="Vector" stroke="var(--stroke-0, #3C3633)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function BatteryFull() {
  return (
    <div className="h-[20px] relative shrink-0 w-[24px]" data-name="battery-full">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 20">
        <g id="battery-full">
          <path d={svgPaths.p1144c080} id="Vector" stroke="var(--stroke-0, #3C3633)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Frame">
      <SignalHigh />
      <WifiHigh />
      <BatteryFull />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="h-[44px] relative shrink-0 w-full" data-name="status-bar">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#3c3633] text-[14px] whitespace-nowrap">9:41</p>
          <Frame />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Fraunces:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#3c3633] text-[32px] whitespace-nowrap" style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}>
        Log the urge
      </p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Frame">
      <Frame2 />
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#8a827e] text-[14px] whitespace-nowrap">pause before you buy</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="relative rounded-[16px] shrink-0 size-[160px]" data-name="Frame">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgFrame} />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular',sans-serif] leading-[normal] not-italic opacity-50 relative shrink-0 text-[#8a827e] text-[16px] w-full">New headphones...</p>
      <div className="h-0 relative shrink-0 w-full" data-name="Line">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 354 1">
            <line id="Line" opacity="0.4" stroke="var(--stroke-0, #D97706)" x2="354" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#8a827e] text-[11px] uppercase whitespace-nowrap">What is it?</p>
      <Frame7 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular',sans-serif] leading-[normal] not-italic opacity-50 relative shrink-0 text-[#8a827e] text-[16px] w-full">$0.00</p>
      <div className="h-0 relative shrink-0 w-full" data-name="Line">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 354 1">
            <line id="Line" opacity="0.4" stroke="var(--stroke-0, #D97706)" x2="354" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#8a827e] text-[11px] uppercase whitespace-nowrap">How much?</p>
      <Frame9 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-name="Frame">
      <Frame6 />
      <Frame8 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="Frame">
      <Frame4 />
      <Frame5 />
    </div>
  );
}

function Chip() {
  return (
    <div className="bg-white content-stretch flex items-start px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-name="chip">
      <div aria-hidden className="absolute border border-[rgba(180,160,130,0.2)] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#8a827e] text-[13px] whitespace-nowrap">Cool Blue</p>
    </div>
  );
}

function Chip1() {
  return (
    <div className="bg-[#d97706] content-stretch flex items-start px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-name="chip">
      <div aria-hidden className="absolute border border-[#d97706] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[13px] text-white whitespace-nowrap">Warm Amber</p>
    </div>
  );
}

function Chip2() {
  return (
    <div className="bg-white content-stretch flex items-start px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-name="chip">
      <div aria-hidden className="absolute border border-[rgba(180,160,130,0.2)] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#8a827e] text-[13px] whitespace-nowrap">Excitement</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-start flex flex-wrap gap-[8px] items-start relative shrink-0 w-full" data-name="Frame">
      <Chip />
      <Chip1 />
      <Chip2 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#8a827e] text-[12px] uppercase whitespace-nowrap">How are you feeling?</p>
      <Frame11 />
    </div>
  );
}

function Chip3() {
  return (
    <div className="bg-white content-stretch flex items-start px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-name="chip">
      <div aria-hidden className="absolute border border-[rgba(180,160,130,0.2)] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#8a827e] text-[13px] whitespace-nowrap">Who I Am</p>
    </div>
  );
}

function Chip4() {
  return (
    <div className="bg-white content-stretch flex items-start px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-name="chip">
      <div aria-hidden className="absolute border border-[rgba(180,160,130,0.2)] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#8a827e] text-[13px] whitespace-nowrap">Who I Want to Be</p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Frame">
      <Chip3 />
      <Chip4 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#8a827e] text-[12px] uppercase whitespace-nowrap">Is this for...</p>
      <Frame13 />
    </div>
  );
}

function Cta() {
  return (
    <div className="bg-[#3b4a2d] content-stretch drop-shadow-[0px_8px_8px_rgba(59,74,45,0.25)] flex items-center justify-center py-[18px] relative rounded-[16px] shrink-0 w-full" data-name="cta">
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-white uppercase whitespace-nowrap">Log it</p>
    </div>
  );
}

function BottomSheet() {
  return (
    <div className="absolute bg-[#f5f0e5] content-stretch flex flex-col gap-[32px] inset-0 items-start pb-[48px] pt-[40px] px-[24px] rounded-tl-[40px] rounded-tr-[40px]" data-name="bottom-sheet">
      <Frame1 />
      <Frame3 />
      <Frame10 />
      <Frame12 />
      <Cta />
    </div>
  );
}

export default function VariationStacked() {
  return (
    <div className="bg-[#e5e5e5] content-stretch flex flex-col items-start relative size-full" data-name="variation-stacked">
      <StatusBar />
      <BottomSheet />
    </div>
  );
}