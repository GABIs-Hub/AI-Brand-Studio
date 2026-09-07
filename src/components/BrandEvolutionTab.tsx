import React, { useState, useEffect } from 'react';
import { BrandBible, BrandMilestone, MilestoneCategory } from '../types';
import { sanitizeSvg } from '../utils/sanitizeSvg';
import {
  getBrandMilestones,
  createMilestoneCheckpoint,
  deleteMilestone,
  formatEvolutionDate,
  compareBrandVersions,
  EvolutionDiffResult,
} from '../lib/evolution';
import {
  GitCommit,
  GitBranch,
  Milestone,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Check,
  Split,
  Eye,
  Calendar,
  Layers,
  CheckCircle2,
  X,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Tag,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BrandEvolutionTabProps {
  brand: BrandBible;
  onRestoreVersion: (restoredBrand: BrandBible) => void;
  onForkNewBrand?: (forkedBrand: BrandBible) => void;
}

export function BrandEvolutionTab({
  brand,
  onRestoreVersion,
  onForkNewBrand,
}: BrandEvolutionTabProps) {
  const [milestones, setMilestones] = useState<BrandMilestone[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal states
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [diffTargetMilestone, setDiffTargetMilestone] = useState<BrandMilestone | null>(null);

  // New Checkpoint Form state
  const [newTitle, setNewTitle] = useState('');
  const [newChangeNote, setNewChangeNote] = useState('');
  const [newCategory, setNewCategory] = useState<MilestoneCategory>('checkpoint');
  const [newTagsInput, setNewTagsInput] = useState('');
  const [customVersion, setCustomVersion] = useState('');

  // Feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Expanded inspection cards
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Load milestones for current brand
  useEffect(() => {
    const loaded = getBrandMilestones(brand);
    setMilestones(loaded);
  }, [brand]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tags = newTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const created = createMilestoneCheckpoint(brand, {
      title: newTitle.trim(),
      changeNote: newChangeNote.trim() || 'Recorded brand milestone checkpoint.',
      category: newCategory,
      tags: tags.length > 0 ? tags : [newCategory, 'Checkpoint'],
      versionOverride: customVersion.trim() || undefined,
    });

    const updated = getBrandMilestones(brand);
    setMilestones(updated);
    setIsCheckpointModalOpen(false);
    setNewTitle('');
    setNewChangeNote('');
    setNewTagsInput('');
    setCustomVersion('');
    showToast(`Milestone ${created.versionLabel} captured successfully!`);
  };

  const handleDelete = (milestoneId: string, versionLabel: string) => {
    if (milestones.length <= 1) {
      showToast('Cannot delete the sole baseline Genesis milestone.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete milestone ${versionLabel}?`)) {
      const updated = deleteMilestone(brand.id, milestoneId);
      setMilestones(updated);
      showToast(`Milestone ${versionLabel} removed.`);
    }
  };

  const handleRestore = (milestone: BrandMilestone) => {
    if (
      window.confirm(
        `Restore "${milestone.title}" (${milestone.versionLabel})? This will load this version snapshot into your active Brand Dashboard.`
      )
    ) {
      onRestoreVersion(milestone.snapshot);
      showToast(`Restored brand version ${milestone.versionLabel}!`);
    }
  };

  const handleCopyJson = (milestone: BrandMilestone) => {
    navigator.clipboard.writeText(JSON.stringify(milestone.snapshot, null, 2));
    setCopiedId(milestone.id);
    showToast(`Copied snapshot spec for ${milestone.versionLabel}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenDiff = (milestone: BrandMilestone) => {
    setDiffTargetMilestone(milestone);
    setIsDiffModalOpen(true);
  };

  // Filter and sort milestones
  const filteredMilestones = milestones
    .filter((m) => {
      const matchesCat =
        selectedCategory === 'all' || m.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.versionLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.changeNote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const getCategoryBadge = (cat: MilestoneCategory) => {
    switch (cat) {
      case 'genesis':
        return {
          label: 'Genesis',
          bg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800',
          icon: Sparkles,
        };
      case 'pivot':
        return {
          label: 'Brand Pivot',
          bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          icon: TrendingUp,
        };
      case 'ai_enhancement':
        return {
          label: 'AI Polish',
          bg: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800',
          icon: Sparkles,
        };
      case 'refinement':
        return {
          label: 'Refinement',
          bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          icon: GitCommit,
        };
      case 'checkpoint':
      default:
        return {
          label: 'Checkpoint',
          bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          icon: Milestone,
        };
    }
  };

  return (
    <div className="space-y-10" id="brand-evolution-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#1A1A1A] dark:bg-[#F9F7F2] text-[#F9F7F2] dark:text-[#1A1A1A] px-4 py-3 shadow-2xl border border-white/20 dark:border-black/20 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              Identity Lineage & Versioning
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif italic text-[#1A1A1A] dark:text-[#F9F7F2]">
            Brand Evolution
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-400 max-w-2xl mt-2 leading-relaxed font-sans">
            A vertical interactive timeline tracking iterative shifts across color palettes, typography, visual marks, and positioning strategy. Restore previous iterations or inspect side-by-side visual diffs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCheckpointModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold border border-[#1A1A1A] dark:border-[#F9F7F2]/30 bg-[#1A1A1A] dark:bg-[#F9F7F2] text-white dark:text-[#1A1A1A] hover:bg-black dark:hover:bg-white transition-all cursor-pointer rounded-none"
            id="create-checkpoint-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Milestone Checkpoint</span>
          </button>
        </div>
      </div>

      {/* Evolution Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1C1C1A] border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-4 space-y-1">
          <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">
            Total Iterations
          </span>
          <div className="text-2xl font-bold font-serif text-gray-900 dark:text-[#F9F7F2]">
            {milestones.length}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-500">Saved identity snapshots</p>
        </div>

        <div className="bg-white dark:bg-[#1C1C1A] border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-4 space-y-1">
          <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">
            Active Release
          </span>
          <div className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
            {milestones[0]?.versionLabel || 'v1.0'}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-500">Current dashboard state</p>
        </div>

        <div className="bg-white dark:bg-[#1C1C1A] border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-4 space-y-1">
          <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">
            Genesis Origin
          </span>
          <div className="text-xs font-bold text-gray-900 dark:text-[#F9F7F2] pt-1">
            {formatEvolutionDate(milestones[milestones.length - 1]?.timestamp || brand.createdAt).full}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-500">Initial creation date</p>
        </div>

        <div className="bg-white dark:bg-[#1C1C1A] border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-4 space-y-1">
          <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">
            Brand Industry
          </span>
          <div className="text-xs font-bold text-gray-900 dark:text-[#F9F7F2] pt-1 truncate">
            {brand.industry}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-500">{brand.brandName}</p>
        </div>
      </div>

      {/* Interactive Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#1C1C1A] border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Milestones' },
            { id: 'genesis', label: 'Genesis' },
            { id: 'checkpoint', label: 'Checkpoints' },
            { id: 'refinement', label: 'Refinements' },
            { id: 'pivot', label: 'Pivots' },
            { id: 'ai_enhancement', label: 'AI Polish' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold border transition-all rounded-none cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:border-[#F9F7F2]'
                  : 'bg-transparent text-gray-600 dark:text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-gray-200 dark:border-zinc-800 hover:border-gray-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search changelog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#1A1A1A] dark:focus:border-[#F9F7F2]"
            />
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-xs font-mono px-2 cursor-pointer"
            title={`Sort ${sortOrder === 'desc' ? 'Oldest First' : 'Newest First'}`}
          >
            {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VERTICAL TIMELINE CONTAINER */}
      {/* ========================================================================= */}
      <div className="relative pl-6 sm:pl-10 space-y-8" id="vertical-timeline-spine">
        {/* Continuous Vertical Line Spine */}
        <div className="absolute left-[19px] sm:left-[35px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#1A1A1A] via-gray-300 dark:via-zinc-700 to-transparent dark:from-[#F9F7F2]" />

        {filteredMilestones.length === 0 ? (
          <div className="bg-white dark:bg-[#1C1C1A] border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-8 text-center ml-4">
            <Milestone className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">No Milestones Found</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Adjust search or filter query to view other evolutionary stages.
            </p>
          </div>
        ) : (
          filteredMilestones.map((milestone, index) => {
            const isGenesis = milestone.category === 'genesis';
            const isLatest = index === 0 && sortOrder === 'desc';
            const catBadge = getCategoryBadge(milestone.category);
            const CatIcon = catBadge.icon;
            const isExpanded = !!expandedCards[milestone.id];
            const { relative, full } = formatEvolutionDate(milestone.timestamp);

            return (
              <div
                key={milestone.id}
                className="relative flex items-start gap-4 sm:gap-6 group"
                id={`timeline-node-${milestone.id}`}
              >
                {/* Timeline Circular Milestone Node */}
                <div
                  className={`relative z-10 shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-md ${
                    isLatest
                      ? 'bg-[#1A1A1A] text-white border-emerald-500 dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:border-emerald-400 ring-4 ring-emerald-500/20'
                      : isGenesis
                      ? 'bg-purple-600 text-white border-purple-300 dark:bg-purple-900 dark:border-purple-400'
                      : 'bg-white dark:bg-[#1C1C1A] text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-gray-300 dark:border-zinc-700 group-hover:border-[#1A1A1A] dark:group-hover:border-[#F9F7F2]'
                  }`}
                >
                  <CatIcon className="w-4 h-4" />
                </div>

                {/* Milestone Content Card */}
                <div className="flex-1 bg-white dark:bg-[#1C1C1A] border border-gray-200 dark:border-gray-200 dark:border-zinc-800 transition-all duration-300 hover:border-[#1A1A1A] dark:hover:border-[#F9F7F2]/50 hover:shadow-md">
                  {/* Card Header Bar */}
                  <div className="p-4 sm:p-6 pb-3 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-zinc-900/30">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black bg-[#1A1A1A] dark:bg-[#F9F7F2] text-white dark:text-[#1A1A1A] px-2 py-0.5 rounded-none">
                        {milestone.versionLabel}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 border ${catBadge.bg}`}
                      >
                        {catBadge.label}
                      </span>
                      {isLatest && (
                        <span className="text-[8px] uppercase tracking-widest font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400 px-2 py-0.5">
                          Active Version
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 text-xs font-sans">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium" title={full}>
                        {relative}
                      </span>
                      <span className="text-[10px] opacity-60 hidden sm:inline">({full})</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-[#F9F7F2] font-serif">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-300 mt-1 leading-relaxed font-sans">
                        {milestone.changeNote}
                      </p>
                    </div>

                    {/* Tags List */}
                    {milestone.tags && milestone.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {milestone.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 text-[9px] font-mono text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800/80 px-2 py-0.5 border border-gray-200 dark:border-gray-200 dark:border-zinc-700"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Visual Asset Strip for this Version Snapshot */}
                    <div className="p-4 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Logo Mark Thumbnail */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white dark:bg-white p-1 border border-gray-300 dark:border-gray-300 shrink-0 flex items-center justify-center">
                          <div
                            className="w-full h-full"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeSvg(milestone.snapshot.logo.primaryLogoSvg),
                            }}
                          />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-[9px] uppercase tracking-widest font-black text-gray-400">
                            Visual Mark
                          </div>
                          <div className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate">
                            {milestone.snapshot.brandName}
                          </div>
                        </div>
                      </div>

                      {/* 5-Color Palette Strip */}
                      <div className="space-y-1">
                        <div className="text-[9px] uppercase tracking-widest font-black text-gray-400">
                          5-Color Harmony
                        </div>
                        <div className="flex items-center gap-1">
                          {milestone.snapshot.palette.slice(0, 5).map((color, cIdx) => (
                            <div
                              key={cIdx}
                              style={{ backgroundColor: color.hex }}
                              className="w-6 h-6 border border-black/10 dark:border-white/10 shadow-xs"
                              title={`${color.role}: ${color.hex}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Typography Pairings */}
                      <div className="space-y-1">
                        <div className="text-[9px] uppercase tracking-widest font-black text-gray-400">
                          Typography Pairing
                        </div>
                        <div className="text-xs font-medium text-gray-800 dark:text-zinc-200 truncate">
                          <span className="font-bold">{milestone.snapshot.typography.headingFont}</span> +{' '}
                          <span className="text-gray-500 dark:text-gray-500">{milestone.snapshot.typography.bodyFont}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Extended Inspection */}
                    {isExpanded && (
                      <div className="p-4 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-3 text-xs animate-in fade-in duration-200">
                        <div>
                          <span className="font-bold text-gray-900 dark:text-[#F9F7F2]">Tagline: </span>
                          <span className="italic text-gray-600 dark:text-gray-600 dark:text-zinc-400">
                            "{milestone.snapshot.tagline}"
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-[#F9F7F2]">Mission: </span>
                          <span className="text-gray-600 dark:text-gray-600 dark:text-zinc-400">
                            {milestone.snapshot.mission}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-[#F9F7F2]">Positioning: </span>
                          <span className="text-gray-600 dark:text-gray-600 dark:text-zinc-400">
                            {milestone.snapshot.positioningStatement}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Interactive Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(milestone)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold bg-[#1A1A1A] dark:bg-[#F9F7F2] text-white dark:text-[#1A1A1A] hover:bg-black dark:hover:bg-white transition-all cursor-pointer"
                          title="Load this milestone as the active dashboard brand"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore Version</span>
                        </button>

                        <button
                          onClick={() => handleOpenDiff(milestone)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold border border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:border-gray-500 text-gray-800 dark:text-zinc-200 transition-all cursor-pointer"
                          title="Compare this milestone side-by-side with active version"
                        >
                          <Split className="w-3 h-3" />
                          <span>Visual Diff</span>
                        </button>

                        <button
                          onClick={() => toggleExpand(milestone.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] uppercase tracking-widest font-medium text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                        >
                          {isExpanded ? (
                            <>
                              <span>Less</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <span>Details</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyJson(milestone)}
                          className="p-1.5 text-gray-500 dark:text-gray-500 hover:text-black dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-gray-200 dark:hover:border-zinc-800 cursor-pointer"
                          title="Copy JSON snapshot"
                        >
                          {copiedId === milestone.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {!isGenesis && (
                          <button
                            onClick={() => handleDelete(milestone.id, milestone.versionLabel)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 cursor-pointer"
                            title="Delete this milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE MILESTONE CHECKPOINT */}
      {/* ========================================================================= */}
      {isCheckpointModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 w-full max-w-lg shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black text-purple-600 dark:text-purple-400">
                  Version Control
                </span>
                <h3 className="text-lg font-bold font-serif text-gray-900 dark:text-[#F9F7F2]">
                  Record Milestone Checkpoint
                </h3>
              </div>
              <button
                onClick={() => setIsCheckpointModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCheckpoint} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Version Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. v${(milestones.length * 0.1 + 1.0).toFixed(1)}`}
                    value={customVersion}
                    onChange={(e) => setCustomVersion(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Milestone Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MilestoneCategory)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                  >
                    <option value="checkpoint">Checkpoint</option>
                    <option value="refinement">Refinement</option>
                    <option value="pivot">Brand Pivot</option>
                    <option value="ai_enhancement">AI Polish</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autumn Refresh: Dark Palette & Heading Weights"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  Changelog & Reason for Revision
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the adjustments made to typography, colors, or positioning statements..."
                  value={newChangeNote}
                  onChange={(e) => setNewChangeNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Typography, Dark Mode, Pitch Deck"
                  value={newTagsInput}
                  onChange={(e) => setNewTagsInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCheckpointModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#1A1A1A] dark:bg-[#F9F7F2] text-white dark:text-[#1A1A1A] hover:bg-black dark:hover:bg-white"
                >
                  Save Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VISUAL DIFF INSPECTOR */}
      {/* ========================================================================= */}
      {isDiffModalOpen && diffTargetMilestone && (
        <DiffInspectorModal
          milestone={diffTargetMilestone}
          activeBrand={brand}
          onClose={() => setIsDiffModalOpen(false)}
          onRestore={() => {
            handleRestore(diffTargetMilestone);
            setIsDiffModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

interface DiffInspectorModalProps {
  milestone: BrandMilestone;
  activeBrand: BrandBible;
  onClose: () => void;
  onRestore: () => void;
}

function DiffInspectorModal({
  milestone,
  activeBrand,
  onClose,
  onRestore,
}: DiffInspectorModalProps) {
  const diff = compareBrandVersions(milestone.snapshot, activeBrand);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#181816] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#1A1A1A] dark:bg-[#111110] text-white flex items-center justify-between border-b border-black">
          <div className="flex items-center gap-3">
            <Split className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-serif italic text-lg text-white">Visual Version Diff Inspector</h3>
              <p className="text-[10px] text-gray-400 font-mono">
                Comparing <span className="text-white font-bold">{milestone.versionLabel}</span> vs.{' '}
                <span className="text-emerald-400 font-bold">Current Active Brand</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diff Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans text-xs">
          {/* Status banner */}
          <div
            className={`p-3 border flex items-center justify-between ${
              diff.hasDifferences
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <span className="font-bold">
              {diff.hasDifferences
                ? '⚡ Variations detected between this milestone and current active brand.'
                : '✓ Identical: This milestone matches the current active brand state exactly.'}
            </span>
          </div>

          {/* Side by side comparison grid */}
          <div className="grid grid-cols-2 gap-6 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 pb-6">
            {/* Left Header */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">
                Snapshot Version
              </span>
              <h4 className="font-bold text-sm text-gray-900 dark:text-[#F9F7F2]">
                {milestone.title} ({milestone.versionLabel})
              </h4>
            </div>

            {/* Right Header */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400">
                Active Brand State
              </span>
              <h4 className="font-bold text-sm text-gray-900 dark:text-[#F9F7F2]">
                {activeBrand.brandName} (Live Dashboard)
              </h4>
            </div>
          </div>

          {/* 1. Logos Side-by-Side */}
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest font-black text-gray-400">
              1. Logomarks
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center justify-center min-h-[120px]">
                <div className="w-20 h-20 p-2 bg-white flex items-center justify-center">
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(milestone.snapshot.logo.primaryLogoSvg) }}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center justify-center min-h-[120px]">
                <div className="w-20 h-20 p-2 bg-white flex items-center justify-center">
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(activeBrand.logo.primaryLogoSvg) }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Color Palettes Diff */}
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest font-black text-gray-400">
              2. 5-Color Harmonies
            </div>
            <div className="grid grid-cols-2 gap-6">
              {/* Snapshot Palette */}
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                {milestone.snapshot.palette.map((color, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: color.hex }}
                        className="w-4 h-4 border border-black/20"
                      />
                      <span>{color.role}</span>
                    </div>
                    <span className="font-mono text-gray-500 dark:text-gray-500">{color.hex}</span>
                  </div>
                ))}
              </div>

              {/* Active Palette */}
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                {activeBrand.palette.map((color, idx) => {
                  const snapCol = milestone.snapshot.palette.find((c) => c.role === color.role);
                  const isChanged = snapCol && snapCol.hex.toLowerCase() !== color.hex.toLowerCase();
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between text-[11px] p-1 ${
                        isChanged ? 'bg-amber-100/60 dark:bg-amber-950/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          style={{ backgroundColor: color.hex }}
                          className="w-4 h-4 border border-black/20"
                        />
                        <span>{color.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-500 dark:text-gray-500">{color.hex}</span>
                        {isChanged && (
                          <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
                            MODIFIED
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Typography Diff */}
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest font-black text-gray-400">
              3. Typography Hierarchy
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-2">
                <div>
                  <div className="text-[9px] text-gray-400 uppercase">Heading Font</div>
                  <div className="font-bold text-sm">{milestone.snapshot.typography.headingFont}</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-400 uppercase">Body Font</div>
                  <div className="font-medium text-xs">{milestone.snapshot.typography.bodyFont}</div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-2">
                <div>
                  <div className="text-[9px] text-gray-400 uppercase">Heading Font</div>
                  <div className="font-bold text-sm flex items-center justify-between">
                    <span>{activeBrand.typography.headingFont}</span>
                    {diff.headingFontChanged && (
                      <span className="text-[9px] font-bold text-amber-600">CHANGED</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-400 uppercase">Body Font</div>
                  <div className="font-medium text-xs flex items-center justify-between">
                    <span>{activeBrand.typography.bodyFont}</span>
                    {diff.bodyFontChanged && (
                      <span className="text-[9px] font-bold text-amber-600">CHANGED</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Taglines & Positioning */}
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest font-black text-gray-400">
              4. Tagline & Positioning
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="italic text-gray-700 dark:text-zinc-300">
                  "{milestone.snapshot.tagline}"
                </div>
                <div className="text-gray-500 dark:text-gray-500 pt-1 text-[11px]">
                  {milestone.snapshot.positioningStatement}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="italic text-gray-700 dark:text-zinc-300">
                  "{activeBrand.tagline}"
                </div>
                <div className="text-gray-500 dark:text-gray-500 pt-1 text-[11px]">
                  {activeBrand.positioningStatement}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-gray-50 dark:bg-[#111110] border-t border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          >
            Close Inspector
          </button>

          <button
            onClick={onRestore}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#1A1A1A] dark:bg-[#F9F7F2] text-white dark:text-[#1A1A1A] hover:bg-black dark:hover:bg-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rollback / Restore {milestone.versionLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
