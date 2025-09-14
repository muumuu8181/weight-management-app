import os
import json
from pathlib import Path

categories = {
    "core_app": {"count": 0, "patterns": ["index.html", "tabs/*/tab-*.js", "tabs/*/tab-*.html", "tabs/*/*.css", "shared/core/*.js", "shared/common*.js"]},
    "config": {"count": 0, "patterns": ["*/config*.js", "*/firebase*.js", "config/*.json", "package.json"]},
    "utilities": {"count": 0, "patterns": ["shared/utils/*.js", "shared/components/*.js"]},
    "styles": {"count": 0, "patterns": ["shared/styles/*.css", "custom/*.css"]},
    "tests": {"count": 0, "patterns": ["*test*.js", "*test*.html", "*checker*.js", "*analyzer*.js"]},
    "reports": {"count": 0, "patterns": ["*report*.html", "*report*.json", "*metrics*.json", "*evidence*.csv"]},
    "docs": {"count": 0, "patterns": ["*.md", "documentation/**/*.md", "handover/**/*.md"]},
    "backups": {"count": 0, "patterns": ["*backup*", "*.bak", "archive/**/*"]},
    "tools": {"count": 0, "patterns": ["tools/**/*.js", "development/tools/**/*.js"]},
    "demos": {"count": 0, "patterns": ["*demo*.html", "examples/*.html"]},
    "build": {"count": 0, "patterns": ["*.bat", "*.sh", "*.ps1", "Makefile"]},
}

ignored = ["node_modules", ".git", "__pycache__", ".cache"]

for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in ignored]
    
    for file in files:
        file_path = os.path.join(root, file)
        categorized = False
        
        # Check each category
        for cat, data in categories.items():
            for pattern in data["patterns"]:
                if "**" in pattern:
                    if pattern.replace("**", "") in file_path:
                        categories[cat]["count"] += 1
                        categorized = True
                        break
                elif "*" in pattern:
                    pattern_parts = pattern.split("*")
                    if all(part in file_path for part in pattern_parts if part):
                        categories[cat]["count"] += 1
                        categorized = True
                        break
                elif pattern == file or pattern in file_path:
                    categories[cat]["count"] += 1
                    categorized = True
                    break
            if categorized:
                break

print("=== CREATIVE FILE ANALYSIS ===")
print("\nREAL Developer Files (what actually matters):")
real_count = categories["core_app"]["count"] + categories["config"]["count"] + categories["utilities"]["count"] + categories["styles"]["count"]
print(f"  Core Application: {categories['core_app']['count']}")
print(f"  Configuration: {categories['config']['count']}")
print(f"  Utilities: {categories['utilities']['count']}")
print(f"  Styles: {categories['styles']['count']}")
print(f"  TOTAL REAL FILES: {real_count}")

print("\nGenerated/Secondary Files:")
secondary_count = categories["tests"]["count"] + categories["reports"]["count"] + categories["tools"]["count"]
print(f"  Tests: {categories['tests']['count']}")
print(f"  Reports: {categories['reports']['count']}")
print(f"  Tools: {categories['tools']['count']}")
print(f"  TOTAL: {secondary_count}")

print("\nDocumentation Bloat:")
print(f"  Documentation: {categories['docs']['count']}")
print(f"  Backups: {categories['backups']['count']}")
print(f"  Examples/Demos: {categories['demos']['count']}")

print("\nBUILD SCRIPTS:")
print(f"  Build/Deploy: {categories['build']['count']}")

bloat_ratio = (categories['docs']['count'] + categories['reports']['count'] + categories['backups']['count']) / max(real_count, 1)
print(f"\n📊 BLOAT RATIO: {bloat_ratio:.2f}x (docs+reports+backups vs real code)")
