(function () {
  'use strict';

  const LOVE_TYPE_NAMES = {
    chaotic: '纠结矛盾型',
    anxious: '恋爱脑上头型',
    avoidant: '回避型依恋',
    secure: '安全感满格型',
    possessive_dominant: '强占有欲型',
    romantic_sweet: '甜宠浪漫型',
    independent_solo: '独立独美型',
    rational_calm: '理性冷静型'
  };

  const SOURCES = [
    {
      testId: 'mbti',
      key: 'mbti_test_history',
      path: 'tests/mbti/index.html?view=history',
      format(record) {
        return {
          id: record.id,
          timestamp: numericTime(record.id, record.date),
          resultCode: record.type,
          resultLabel: record.typeName || '人格类型'
        };
      }
    },
    {
      testId: 'history',
      key: 'history_figure_test_history',
      path: 'tests/history/index.html?view=history',
      format(record) {
        const similarity = Number.isFinite(record.similarity) ? ` · ${Math.round(record.similarity)}% 相似` : '';
        return {
          id: record.id,
          timestamp: numericTime(record.id, record.date),
          resultLabel: `${record.figureName || '历史人物'}${similarity}`
        };
      }
    },
    {
      testId: 'love',
      key: 'love_type_test_history',
      path: 'tests/love/index.html?view=history',
      format(record) {
        return {
          id: record.id,
          timestamp: numericTime(record.id, record.date),
          resultLabel: LOVE_TYPE_NAMES[record.typeKey] || '恋爱类型结果'
        };
      }
    },
    {
      testId: 'maturity',
      key: 'maturity_test_history',
      path: 'tests/maturity/index.html?view=history',
      format(record) {
        const score = Number.isFinite(record.overall) ? ` · ${Math.round(record.overall)} 分` : '';
        return {
          id: record.id,
          timestamp: numericTime(record.id, record.date),
          resultLabel: `${record.level || '成熟度结果'}${score}`
        };
      }
    },
    {
      testId: 'animal',
      key: 'animal_test_history',
      path: 'tests/animal/index.html?view=history',
      format(record) {
        return {
          id: record.timestamp,
          timestamp: numericTime(record.timestamp),
          resultLabel: `${record.animalEmoji || ''} ${record.animalName || '动物人格'}`.trim()
        };
      }
    },
    {
      testId: 'dark-triad',
      key: 'dark_triad_test_history',
      path: 'tests/dark-triad/index.html?view=history',
      format(record) {
        return {
          id: record.id,
          timestamp: numericTime(record.id, record.date),
          resultLabel: `${record.resultEmoji || ''} ${record.resultName || '暗黑人格结果'}`.trim()
        };
      }
    },
    {
      testId: 'tarot',
      key: 'tarot-history',
      path: 'tests/tarot/index.html?view=history',
      format(record) {
        const meta = record.interpretation?.meta || {};
        return {
          id: record.id,
          timestamp: numericTime(record.timestamp || meta.timestamp),
          resultLabel: `${record.spreadName || meta.spread || '塔罗牌阵'} · ${record.domainName || meta.domain || '综合'}`
        };
      }
    }
  ];

  function numericTime(primary, fallback) {
    const numeric = Number(primary);
    if (Number.isFinite(numeric) && numeric > 1000000000000) return numeric;

    const parsedPrimary = Date.parse(primary);
    if (Number.isFinite(parsedPrimary)) return parsedPrimary;

    const parsedFallback = Date.parse(fallback);
    if (Number.isFinite(parsedFallback)) return parsedFallback;

    return 0;
  }

  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function readAll(testConfig) {
    const configById = new Map((testConfig || []).map((test) => [test.id, test]));
    const records = [];

    SOURCES.forEach((source) => {
      readArray(source.key).forEach((record, index) => {
        try {
          const summary = source.format(record);
          const config = configById.get(source.testId);
          records.push({
            id: String(summary.id ?? `${source.testId}-${index}`),
            testId: source.testId,
            testName: config?.name || source.testId,
            icon: config?.icon || '◇',
            color: config?.color || '#6657E8',
            timestamp: summary.timestamp || 0,
            resultCode: summary.resultCode || '',
            resultLabel: summary.resultLabel || '查看结果',
            detailPath: source.path
          });
        } catch (error) {
          // 单条旧记录异常时跳过，不影响其他历史记录。
        }
      });
    });

    return records.sort((a, b) => b.timestamp - a.timestamp);
  }

  function getRecent(testConfig, limit) {
    return readAll(testConfig).slice(0, Math.max(1, limit || 3));
  }

  function formatDate(timestamp) {
    if (!timestamp) return '较早记录';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(timestamp));
  }

  window.WTestHistory = { readAll, getRecent, formatDate };
})();
