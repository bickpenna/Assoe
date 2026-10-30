import { spawnSync } from 'node:child_process';

const KNOWN_ADVISORY = 1240992;
const audit = spawnSync('npm', ['audit', '--audit-level=high', '--json'], {
  encoding: 'utf8',
});

if (audit.error || audit.signal || ![0, 1].includes(audit.status)) {
  console.error('Impossibile completare npm audit dello Studio.');
  if (audit.stderr) console.error(audit.stderr.trim());
  process.exit(1);
}

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  console.error('Impossibile leggere il report npm audit dello Studio.');
  if (audit.stderr) console.error(audit.stderr.trim());
  process.exit(audit.status || 1);
}

if (!report || report.error || report.auditReportVersion !== 2
  || !report.vulnerabilities || typeof report.vulnerabilities !== 'object'
  || Array.isArray(report.vulnerabilities) || !report.metadata?.vulnerabilities) {
  console.error('Report npm audit dello Studio assente, incompleto o non valido.');
  process.exit(1);
}

const vulnerabilities = Object.entries(report.vulnerabilities ?? {})
  .filter(([, vulnerability]) => ['high', 'critical'].includes(vulnerability.severity));

if (audit.status === 1 && vulnerabilities.length === 0) {
  console.error('npm audit dello Studio è fallito senza un report high/critical coerente.');
  process.exit(1);
}
const advisoryIds = new Set();
const packagesWithCompatibleFix = [];

for (const [name, vulnerability] of vulnerabilities) {
  const visit = (entry) => {
    if (entry && typeof entry === 'object') {
      if (Number.isInteger(entry.source)) advisoryIds.add(entry.source);
      Object.values(entry).forEach(visit);
    } else if (Array.isArray(entry)) {
      entry.forEach(visit);
    }
  };

  visit(vulnerability.via);
  if (vulnerability.fixAvailable && !vulnerability.fixAvailable.isSemVerMajor) {
    packagesWithCompatibleFix.push(name);
  }
}

const unknownAdvisories = [...advisoryIds].filter((id) => id !== KNOWN_ADVISORY);
if (unknownAdvisories.length > 0 || packagesWithCompatibleFix.length > 0) {
  console.error('Audit Studio fallito: è presente una vulnerabilità nuova o correggibile senza downgrade major.');
  if (unknownAdvisories.length > 0) console.error(`Advisory non documentate: ${unknownAdvisories.join(', ')}`);
  if (packagesWithCompatibleFix.length > 0) console.error(`Pacchetti aggiornabili: ${packagesWithCompatibleFix.join(', ')}`);
  process.exit(1);
}

if (vulnerabilities.length > 0) {
  console.warn(`Audit Studio: ${vulnerabilities.length} vulnerabilità high/critical già documentate nella catena Sanity.`);
  console.warn(`Eccezione mantenuta per GHSA-vfj7-8cjw-p6xm / advisory ${KNOWN_ADVISORY}: la correzione proposta da npm è un downgrade major.`);
}

process.exit(0);
