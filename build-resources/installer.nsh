; HexBrief NSIS installer
; Uses customWelcomePage and customFinishPage — the correct hooks
; customHeader only sets non-conflicting defines

!macro customHeader
  ; These are safe — they don't conflict with anything electron-builder pre-defines
  !define MUI_ABORTWARNING
  !define MUI_ABORTWARNING_TEXT "Are you sure you want to cancel the HexBrief installation?"
!macroend

!macro customWelcomePage
  ; Define welcome page text BEFORE MUI_PAGE_WELCOME is inserted
  !define MUI_WELCOMEPAGE_TITLE "Welcome to HexBrief"
  !define MUI_WELCOMEPAGE_TEXT "HexBrief is your personal morning dashboard.$\r$\n$\r$\nWeather, tasks, headlines and calendar in one place. No accounts. No tracking. No subscriptions.$\r$\n$\r$\nClick Next to continue."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customFinishPage
  ; Define finish page text BEFORE MUI_PAGE_FINISH is inserted
  !define MUI_FINISHPAGE_TITLE "HexBrief is ready"
  !define MUI_FINISHPAGE_TEXT "Installed successfully.$\r$\n$\r$\nOpen it each morning for your daily brief."
  !define MUI_FINISHPAGE_RUN "$INSTDIR\HexBrief.exe"
  !define MUI_FINISHPAGE_RUN_TEXT "Launch HexBrief now"
  !insertmacro MUI_PAGE_FINISH
!macroend

!macro customInstall
  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\HexBrief"
!macroend
