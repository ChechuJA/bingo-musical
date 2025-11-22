#!/usr/bin/env node

/**
 * Security Validation Script for Bingo Musical
 * Detects potential malicious redirects, injected scripts, and security issues
 * Run: node scripts/security-check.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Patterns that indicate potential security issues
const suspiciousPatterns = [
  {
    name: 'Suspicious external redirect',
    pattern: /window\.location\s*=\s*["']https?:\/\/(?!bingomusical\.com|bingomusicalgratis\.es)/gi,
    severity: 'HIGH'
  },
  {
    name: 'document.write (potential injection)',
    pattern: /document\.write\(/gi,
    severity: 'MEDIUM'
  },
  {
    name: 'eval() usage (dangerous)',
    pattern: /\beval\s*\(/gi,
    severity: 'HIGH'
  },
  {
    name: 'innerHTML assignment (potential XSS)',
    pattern: /\.innerHTML\s*=\s*(?!['"`]\s*['"`]|sanitize)/gi,
    severity: 'MEDIUM'
  },
  {
    name: 'Base64 encoded script (obfuscation)',
    pattern: /atob\(|btoa\(/gi,
    severity: 'MEDIUM'
  },
  {
    name: 'Suspicious iframe injection',
    pattern: /<iframe[^>]*src=["']https?:\/\/(?!open\.spotify\.com|www\.google\.com|fundingchoicesmessages\.google\.com)/gi,
    severity: 'HIGH'
  },
  {
    name: 'Meta refresh redirect',
    pattern: /<meta[^>]*http-equiv=["']refresh["'][^>]*url=/gi,
    severity: 'HIGH'
  },
  {
    name: 'Suspicious external script',
    pattern: /<script[^>]*src=["']https?:\/\/(?!pagead2\.googlesyndication\.com|fundingchoicesmessages\.google\.com|www\.gstatic\.com|fonts\.googleapis\.com)/gi,
    severity: 'HIGH'
  },
  {
    name: 'Top-level navigation (redirect)',
    pattern: /top\.location\s*=|parent\.location\s*=/gi,
    severity: 'HIGH'
  },
  {
    name: 'Form action to external site',
    pattern: /<form[^>]*action=["']https?:\/\/(?!bingomusical\.com|bingomusicalgratis\.es)/gi,
    severity: 'MEDIUM'
  }
];

// Whitelist of legitimate external domains
const whitelist = [
  'bingomusical.com',
  'bingomusicalgratis.es',
  'open.spotify.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'pagead2.googlesyndication.com',
  'fundingchoicesmessages.google.com',
  'www.gstatic.com',
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'firebaseio.com',
  'schema.org'
];

let totalIssues = 0;
const issuesByFile = new Map();

function scanFile(filePath, content) {
  const issues = [];
  
  // Note: For very large files (>1MB), consider using streaming approach
  // Current implementation is suitable for typical web project files
  suspiciousPatterns.forEach(({ name, pattern, severity }) => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      // Get line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      
      // Check if it's a legitimate domain
      let isWhitelisted = false;
      for (const domain of whitelist) {
        if (match[0].includes(domain)) {
          isWhitelisted = true;
          break;
        }
      }
      
      if (!isWhitelisted) {
        issues.push({
          name,
          severity,
          line: lineNumber,
          snippet: match[0].substring(0, 100)
        });
      }
    }
  });
  
  if (issues.length > 0) {
    issuesByFile.set(filePath, issues);
    totalIssues += issues.length;
  }
}

function scanDirectory(dir, extensions = ['.html', '.js']) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules, .git, and other system directories
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath, extensions);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          scanFile(fullPath, content);
        } catch (err) {
          console.error(`${colors.red}Error reading ${fullPath}: ${err.message}${colors.reset}`);
        }
      }
    }
  }
}

function printReport() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}   Bingo Musical - Security Scan Report${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  if (totalIssues === 0) {
    console.log(`${colors.green}✓ No security issues detected!${colors.reset}\n`);
    console.log('All scanned files passed security validation.\n');
    return 0;
  }
  
  console.log(`${colors.yellow}⚠ Found ${totalIssues} potential security issue(s)${colors.reset}\n`);
  
  for (const [filePath, issues] of issuesByFile) {
    console.log(`${colors.yellow}File: ${filePath}${colors.reset}`);
    
    issues.forEach(issue => {
      const severityColor = issue.severity === 'HIGH' ? colors.red : colors.yellow;
      console.log(`  ${severityColor}[${issue.severity}]${colors.reset} ${issue.name}`);
      console.log(`    Line ${issue.line}: ${issue.snippet}${issue.snippet.length >= 100 ? '...' : ''}`);
    });
    console.log('');
  }
  
  console.log(`${colors.blue}Recommendations:${colors.reset}`);
  console.log('1. Review all flagged code for legitimacy');
  console.log('2. Remove any suspicious external redirects');
  console.log('3. Ensure all external scripts are from trusted sources');
  console.log('4. Add Subresource Integrity (SRI) to external scripts');
  console.log('5. Implement Content Security Policy (CSP) headers\n');
  
  return 1;
}

// Main execution
console.log('Starting security scan...\n');
const rootDir = process.cwd();
scanDirectory(rootDir, ['.html', '.js']);
const exitCode = printReport();
process.exit(exitCode);
