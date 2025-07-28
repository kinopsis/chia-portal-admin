# 🤖 ChatBot Deployment Guide

## 🚨 Critical Issues Resolved

This guide addresses the two critical issues affecting the AI ChatWidget in production:

### Issue 1: Chat API Error (500 Internal Server Error) ✅ FIXED
### Issue 2: Visual Layout Problems ✅ FIXED

## 🔧 Environment Variables Configuration

### Required Variables for Coolify

Configure these **exact** environment variables in your Coolify deployment:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration (REQUIRED for ChatBot)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Feature Flags (REQUIRED)
NEXT_PUBLIC_ENABLE_AI_CHATBOT=true

# Application Configuration
APP_ENV=production
NODE_ENV=production
```

### ⚠️ Critical Notes

1. **SUPABASE_SERVICE_ROLE_KEY**: Must be the service role key (not anon key)
2. **OPENAI_API_KEY**: Must start with `sk-` and be a valid OpenAI API key
3. **NEXT_PUBLIC_ENABLE_AI_CHATBOT**: Must be exactly `true` (not `"true"`)

## 🚀 Deployment Steps

### Step 1: Update Environment Variables
1. Go to your Coolify project settings
2. Navigate to Environment Variables
3. Add/update all variables listed above
4. **Verify** each variable name is exactly as shown (case-sensitive)

### Step 2: Rebuild Application
1. **Important**: Do a full rebuild, not just redeploy
2. This ensures Docker picks up the new environment variables
3. Wait for build to complete successfully

### Step 3: Verify Deployment
1. Visit your site: https://chia.torrecentral.com
2. Look for the floating chat button in bottom-right corner
3. Click the button to open the chat widget
4. Send a test message to verify API functionality

## 🔍 Troubleshooting

### ChatWidget Not Appearing
```javascript
// Run in browser console to debug:
console.log('FEATURE_FLAGS:', window.__NEXT_DATA__?.props?.pageProps?.FEATURE_FLAGS)
console.log('ChatWidget element:', document.querySelector('[aria-label*="Abrir asistente"]'))
```

### API Errors (500)
Check server logs for these specific errors:
- "Service configuration incomplete" → Missing environment variables
- "OpenAI configuration error" → Invalid OpenAI API key
- "Failed to create chat session" → Supabase connection issues

### Visual Overlap Issues
The ChatWidget now uses:
- `z-index: 9999` for maximum layer priority
- Responsive width constraints
- Mobile-specific positioning
- Backdrop blur for better visibility

## 📱 Mobile Responsiveness

The ChatWidget now automatically adapts to mobile screens:
- Full-width on screens < 640px
- Proper spacing from screen edges
- Touch-friendly button sizes
- Prevents horizontal scrolling

## 🛡️ Error Handling

New error boundary provides:
- Graceful error recovery
- User-friendly error messages
- Retry functionality
- Fallback UI when ChatWidget fails

## ✅ Verification Checklist

- [ ] All environment variables configured in Coolify
- [ ] Full rebuild completed successfully
- [ ] ChatWidget button appears on homepage
- [ ] Chat window opens when button clicked
- [ ] Test message sends successfully
- [ ] No console errors in browser
- [ ] Mobile layout works correctly
- [ ] No visual overlap with page content

## 🔗 Related Files Modified

- `Dockerfile` - Added missing environment variables
- `coolify.yml` - Updated build args and environment list
- `docker-compose.yml` - Added missing build arguments
- `src/components/chat/ChatWidget.tsx` - Fixed z-index and responsive design
- `src/app/globals.css` - Added ChatWidget-specific CSS utilities
- `src/components/chat/ChatErrorBoundary.tsx` - New error handling component
- `src/components/layout/ConditionalLayout/ConditionalLayout.tsx` - Added error boundary

## 📞 Support

If issues persist after following this guide:
1. Check browser console for JavaScript errors
2. Verify all environment variables are set correctly
3. Ensure OpenAI API key has sufficient credits
4. Check Supabase project is active and accessible

---

**Last Updated**: 2025-07-28
**Status**: ✅ Ready for Production Deployment
