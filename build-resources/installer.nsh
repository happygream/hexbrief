; HexBrief NSIS installer
; customHeader must be EMPTY — electron-builder pre-defines everything before it runs
; All customisation goes in customWelcomePage and customFinishPage

!macro customHeader
!macroend

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to HexBrief"
  !define MUI_WELCOMEPAGE_TEXT "HexBrief is your personal morning dashboard.$\r$\n$\r$\nWeather, tasks, headlines and calendar in one place.$\r$\nNo accounts. No tracking. No subscriptions.$\r$\n$\r$\nClick Next to continue."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customFinishPage
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
